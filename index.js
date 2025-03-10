let map;
let lat, lng;
getLocation();

let directionsService;
let directionsRenderer;

async function initMap() {
  try {
    await getLocation(); // Ensure lat and lng are set before initializing the map
    console.log("User Location:", lat, lng);
    
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    
    let center = new google.maps.LatLng(lat, lng);

    map = new Map(document.getElementById("map"), {
      center: center,
      zoom: 11,
      mapId: "DEMO_MAP_ID",
    });

    // Initialize Directions API
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    const geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();

    document.getElementById("submit").addEventListener("click", () => {
      geocodeLatLng(geocoder, map, infowindow);
    });
  } catch (error) {
    console.error("Error getting location:", error);
  }
}


// Function to get directions from user's location to restaurant
window.getDirections = function(destLat, destLng) {
  const start = new google.maps.LatLng(lat, lng);
  const end = new google.maps.LatLng(destLat, destLng);

  const request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING, // You can change this to WALKING, BICYCLING, or TRANSIT
  };

  directionsService.route(request, function (result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
    } else {
      alert("Could not get directions: " + status);
    }
  });
};

function geocodeLatLng(geocoder, map, infowindow) {
  // const input = document.getElementById("latlng").value;
  // const latlngStr = input.split(",", 2);
  // getLocation();
  const latlng = {
    lat: lat,
    lng: lng,
  };
  console.log(latlng)
  // console.log(lng)
  geocoder
    .geocode({ location: latlng })
    .then((response) => {
      if (response.results[0]) {
        map.setZoom(11);
        console.log("latlng check 1")
        const marker = new google.maps.Marker({
          position: latlng,
          map: map,
          draggable: true,
          title: "You're here! Drag the pin to your exact location"
        });

        infowindow.setContent(response.results[0].formatted_address);
        infowindow.open(map, marker);
        infowindow.setPosition(marker.position);
        infowindow.setContent("You are here!");
        infowindow.open(map);
        map.setCenter(marker.position);
        map.setZoom(15);
        nearbySearch();

      } else {
        console.log("latlng check 2")
        window.alert("No results found");
      }
    })
    .catch((e) =>
      console.log("Geocoder failed due to: " + e)

    );
}

let markers = []; // Global array to store markers
let infowindow; // Global info window

async function nearbySearch() {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  let center = new google.maps.LatLng(lat, lng);
  const request = {
    fields: ["displayName", "location", "businessStatus", "types", "rating", "photos"],
    locationRestriction: {
      center: center,
      radius: parseInt(document.getElementById("radius").value, 10) * 1000,
    },
    includedPrimaryTypes: ["restaurant"],
    maxResultCount: 10,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "en-US",
    region: "us",
  };

  clearMarkers();

  const { places } = await Place.searchNearby(request);

  if (places.length) {
    console.log(places);

    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    places.forEach((place) => {
      // Ensure proper extraction of lat, lng
      const position = place.location;
      const destLat = position.lat();
      const destLng = position.lng();

      const marker = new AdvancedMarkerElement({
        map,
        position,
        title: place.displayName,
      });

      markers.push(marker);
      bounds.extend(position);

      let imageUrl = "";
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photoReference || place.photos[0].photo_reference;
        if (photoReference) {
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=ADD_API_KEY`;
        }
      }

      marker.addListener("click", () => {
        console.log(`Clicked Marker: ${place.displayName}, lat: ${destLat}, lng: ${destLng}`);

        const content = `
          <div style="width: 250px; text-align: center;">
            <h3>${place.displayName}</h3>
            ${imageUrl ? `<img src="${imageUrl}" alt="Restaurant Image" style="width: 100%; border-radius: 10px; margin-bottom: 10px;">` : "<p>No Image Available</p>"}
            <p><strong>Type:</strong> ${place.types ? place.types.join(", ") : "Not available"}</p>
            <p><strong>Rating:</strong> ${place.rating ? place.rating : "No rating"}</p>
            <button onclick="getDirections(${destLat}, ${destLng})" style="padding: 10px; margin-top: 10px; background-color: blue; color: white; border: none; border-radius: 5px; cursor: pointer;">Get Directions</button>
          </div>
        `;
        infowindow.setContent(content);
        infowindow.setPosition(position);
        infowindow.open(map);
      });
    });

    map.fitBounds(bounds);
  } else {
    console.log("No results found");
  }
}

// Function to remove all existing markers from the map
function clearMarkers() {
  markers.forEach((marker) => {
    marker.map = null; // Remove marker from the map
  });
  markers = []; // Clear the array
}


initMap();

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          resolve({ lat, lng });
        },
        (error) => reject(error)
      );
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
}

function showPosition(position) {
  console.log(position);

  lat = position.coords.latitude;
  lng = position.coords.longitude;
}