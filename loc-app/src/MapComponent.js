import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapRefObject = useRef(null); // ⬅️ Holds the actual map instance
  const [radius, setRadius] = useState(10);
  const [latLng, setLatLng] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [routeType, setRouteType] = useState("DRIVING");
  const [markers, setMarkers] = useState([]);
  const [googleReady, setGoogleReady] = useState(false);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps loaded");
      setGoogleReady(true);
    };
    document.body.appendChild(script);
  }, []);

  const getLocation = () => {
    if (!googleReady) {
      alert("Google Maps not loaded yet. Please wait.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLatLng(userLatLng);
        initMap(userLatLng);
      },
      () => alert("Geolocation failed.")
    );
  };

  const initMap = (coords) => {
    const gmaps = window.google.maps;
    const mapObj = new gmaps.Map(mapRef.current, {
      center: coords,
      zoom: 14
    });

    new gmaps.Marker({
      position: coords,
      map: mapObj,
      title: "You are here",
      draggable: true
    });

    const iw = new gmaps.InfoWindow({ content: "You are here!" });
    iw.open(mapObj);
    setInfowindow(iw);
    mapRefObject.current = mapObj; // ✅ Store live map reference

    searchNearby(mapObj, coords);
  };

  const searchNearby = (mapObj, coords) => {
    const gmaps = window.google.maps;
    const service = new gmaps.places.PlacesService(mapObj);

    const request = {
      location: coords,
      radius: radius * 1000,
      type: "restaurant"
    };

    clearMarkers();

    service.nearbySearch(request, (results, status) => {
      if (status === gmaps.places.PlacesServiceStatus.OK) {
        const bounds = new gmaps.LatLngBounds();
        const newMarkers = [];

        results.forEach((place) => {
          const position = place.geometry.location;

          const marker = new gmaps.Marker({
            map: mapObj,
            position,
            title: place.name,
            icon: {
              url: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
              scaledSize: new gmaps.Size(32, 32)
            }
          });

          marker.addListener("click", () => {
            if (!latLng) {
              alert("Please click 'Locate Me' first.");
              return;
            }

            const imageUrl = place.photos?.[0]?.getUrl({ maxWidth: 300 }) || '';
            const distance = gmaps.geometry.spherical.computeDistanceBetween(
              new gmaps.LatLng(latLng.lat, latLng.lng),
              position
            ) / 1000;

            const stars = place.rating
              ? '⭐'.repeat(Math.floor(place.rating)) + ` (${place.rating.toFixed(1)})`
              : 'No rating';

            const contentDiv = document.createElement("div");
            contentDiv.style.width = "250px";
            contentDiv.style.textAlign = "center";

            const name = document.createElement("h3");
            name.innerText = place.name;

            if (imageUrl) {
              const img = document.createElement("img");
              img.src = imageUrl;
              img.alt = place.name;
              img.style = "width: 100%; border-radius: 10px; margin-bottom: 10px;";
              contentDiv.appendChild(img);
            }

            const rating = document.createElement("p");
            rating.innerHTML = `<strong>Rating:</strong> ${stars}`;

            const dist = document.createElement("p");
            dist.innerHTML = `<strong>Distance:</strong> ${distance.toFixed(2)} km`;

            const btn = document.createElement("button");
            btn.innerText = "Get Directions";
            btn.style = "padding: 10px; margin-top: 10px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;";
            btn.addEventListener("click", () => {
              console.log("🧭 Directions button clicked");
              getDirections(position.lat(), position.lng());
            });

            contentDiv.appendChild(name);
            contentDiv.appendChild(rating);
            contentDiv.appendChild(dist);
            contentDiv.appendChild(btn);

            infowindow.setContent(contentDiv);
            infowindow.setPosition(position);
            infowindow.open(mapObj);
          });

          newMarkers.push(marker);
          bounds.extend(position);
        });

        setMarkers(newMarkers);
        mapObj.fitBounds(bounds);
      } else {
        alert("No nearby restaurants found.");
      }
    });
  };

  const getDirections = (destLat, destLng) => {
    const map = mapRefObject.current;
    if (!latLng || !map) {
      alert("Please click 'Locate Me' first.");
      return;
    }

    const gmaps = window.google.maps;
    const start = new gmaps.LatLng(latLng.lat, latLng.lng);
    const end = new gmaps.LatLng(destLat, destLng);

    const directionsService = new gmaps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new gmaps.DirectionsRenderer();
    }

    directionsRendererRef.current.setMap(map); // ✅ Attach renderer to correct map
    directionsRendererRef.current.set('directions', null); // Clear any previous route

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: gmaps.TravelMode[routeType]
      },
      (result, status) => {
        console.log("🛣️ Route status:", status);
        if (status === gmaps.DirectionsStatus.OK) {
          clearMarkers();
          directionsRendererRef.current.setDirections(result);
          infowindow?.close();
          console.log("✅ Route rendered");
        } else {
          alert("Could not get directions: " + status);
        }
      }
    );
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  return (
    <>
      <div id="floating-panel">
        <input type="button" value="Locate Me" onClick={getLocation} />
        <input type="button" value="Clear Markers" onClick={clearMarkers} />
        <div className="slidecontainer">
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            className="slider"
            onChange={(e) => setRadius(e.target.value)}
          />
          <p>Radius: {radius} km</p>
        </div>
        <select onChange={(e) => setRouteType(e.target.value)} value={routeType}>
          <option value="DRIVING">Driving</option>
          <option value="WALKING">Walking</option>
          <option value="BICYCLING">Bicycling</option>
          <option value="TRANSIT">Transit</option>
        </select>
      </div>
      <div id="map" ref={mapRef} style={{ height: "100vh", width: "100%" }}></div>
    </>
  );
};

export default MapComponent;
