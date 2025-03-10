let map;
let lat, lng;
getLocation();

async function initMap() {
  getLocation();
  console.log(lat)
  console.log(lng)
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  let center = new google.maps.LatLng(lat, lng);

  map = new Map(document.getElementById("map"), {
    center: center,
    zoom: 11,
    mapId: "DEMO_MAP_ID",
  });
  const geocoder = new google.maps.Geocoder();
  const infowindow = new google.maps.InfoWindow();

  document.getElementById("submit").addEventListener("click", () => {
    geocodeLatLng(geocoder, map, infowindow);
  });
}
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
  const { InfoWindow } = await google.maps.importLibrary("maps");

  // Initialize InfoWindow
  infowindow = new InfoWindow();

  // Restrict within the map viewport.
  let center = new google.maps.LatLng(lat, lng);
  const request = {
    fields: ["displayName", "location", "businessStatus", "types", "rating", "photos"],
    locationRestriction: {
      center: center,
      radius: parseInt(document.getElementById("radius").value, 10) * 1000, // Convert km to meters
    },
    includedPrimaryTypes: ["restaurant"],
    maxResultCount: 10, // Get more results
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "en-US",
    region: "us",
  };

  // Remove existing markers before making a new search
  clearMarkers();

  // Perform Nearby Search
  const { places } = await Place.searchNearby(request);

  if (places.length) {
    console.log(places);

    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    // Loop through and add new markers
    places.forEach((place) => {
      const marker = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      markers.push(marker); // Store marker in the array
      bounds.extend(place.location);

      // Extract photo_reference and construct the image URL
      let imageUrl = "";
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photoReference || place.photos[0].photo_reference; // Some API versions use different field names
        if (photoReference) {
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=YOUR_GOOGLE_MAPS_API_KEY`;
        }
      }

      // Add click event to show details in InfoWindow
      marker.addListener("click", () => {
        const content = `
          <div style="width: 250px; text-align: center;">
            <h3>${place.displayName}</h3>
            ${imageUrl ? `<img src="${imageUrl}" alt="Restaurant Image" style="width: 100%; border-radius: 10px; margin-bottom: 10px;">` : "<p>No Image Available</p>"}
            <p><strong>Type:</strong> ${place.types ? place.types.join(", ") : "Not available"}</p>
            <p><strong>Rating:</strong> ${place.rating ? place.rating : "No rating"}</p>
          </div>
        `;
        infowindow.setContent(content);
        infowindow.setPosition(place.location);
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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}

function showPosition(position) {
  console.log(position);

  lat = position.coords.latitude;
  lng = position.coords.longitude;
}