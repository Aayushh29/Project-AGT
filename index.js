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

async function nearbySearch() {
  // Import required libraries
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Restrict within the map viewport.
  let center = new google.maps.LatLng(lat, lng);
  const request = {
    fields: ["displayName", "location", "businessStatus"],
    locationRestriction: {
      center: center,
      radius: parseInt(document.getElementById("radius").value, 10) * 1000,
    },
    includedPrimaryTypes: ["restaurant"],
    maxResultCount: 5,
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
    });

    map.fitBounds(bounds);
  } else {
    console.log("No results");
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