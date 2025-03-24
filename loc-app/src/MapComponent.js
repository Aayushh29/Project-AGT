import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapRefObject = useRef(null);
  const [radius, setRadius] = useState(10);
  const [routeType, setRouteType] = useState("DRIVING");
  const [googleReady, setGoogleReady] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const destinationRef = useRef(null);
  const latLngRef = useRef(null);
  const infowindowRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [routeSummary, setRouteSummary] = useState(null);

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

  useEffect(() => {
    if (destinationRef.current && latLngRef.current) {
      getDirections(destinationRef.current.lat, destinationRef.current.lng);
    }
  }, [routeType]);

  useEffect(() => {
    if (googleReady && window.google?.maps) {
      const input = document.getElementById("autocomplete-input");
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.setBounds(new window.google.maps.LatLngBounds(
        { lat: latLngRef.current?.lat - 0.1, lng: latLngRef.current?.lng - 0.1 },
        { lat: latLngRef.current?.lat + 0.1, lng: latLngRef.current?.lng + 0.1 }
      ));
      autocomplete.setOptions({ strictBounds: true });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        latLngRef.current = coords;
        initMap(coords);
      });
      autocompleteRef.current = autocomplete;
    }
  }, [googleReady]);

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
        latLngRef.current = userLatLng;
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
    infowindowRef.current = iw;
    mapRefObject.current = mapObj;

    searchNearby(mapObj, coords);
  };

  const searchNearby = (mapObj, coords) => {
    const gmaps = window.google.maps;
    const service = new gmaps.places.PlacesService(mapObj);

    const request = {
      location: coords,
      radius: radius * 1000,
      type: "restaurant",
      openNow: openNow
    };

    clearMarkers();

    service.nearbySearch(request, (results, status) => {
      if (status === gmaps.places.PlacesServiceStatus.OK) {
        const bounds = new gmaps.LatLngBounds();
        const newMarkers = [];

        results.forEach((place) => {
          if (place.rating < minRating) return;

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
            if (!latLngRef.current) {
              alert("Please click 'Locate Me' first.");
              return;
            }

            const imageUrl = place.photos?.[0]?.getUrl({ maxWidth: 300 }) || '';
            const distance = gmaps.geometry.spherical.computeDistanceBetween(
              new gmaps.LatLng(latLngRef.current.lat, latLngRef.current.lng),
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

            infowindowRef.current.setContent(contentDiv);
            infowindowRef.current.setPosition(position);
            infowindowRef.current.open(mapObj);
          });

          newMarkers.push(marker);
          bounds.extend(position);
        });

        markersRef.current = newMarkers;
        mapObj.fitBounds(bounds);
      } else {
        alert("No nearby restaurants found.");
      }
    });
  };

  const getDirections = (destLat, destLng) => {
    const map = mapRefObject.current;
    if (!latLngRef.current || !map) {
      alert("Please click 'Locate Me' first.");
      return;
    }

    const gmaps = window.google.maps;
    const start = new gmaps.LatLng(latLngRef.current.lat, latLngRef.current.lng);
    const end = new gmaps.LatLng(destLat, destLng);

    destinationRef.current = { lat: destLat, lng: destLng };

    const directionsService = new gmaps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new gmaps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#003366",
          strokeOpacity: 0.9,
          strokeWeight: 6
        }
      });
    }

    directionsRendererRef.current.setMap(map);
    directionsRendererRef.current.set('directions', null);

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: gmaps.TravelMode[routeType]
      },
      (result, status) => {
        if (status === gmaps.DirectionsStatus.OK) {
          clearMarkers();
          directionsRendererRef.current.setDirections(result);
          infowindowRef.current?.close();
          const leg = result.routes[0].legs[0];
          setRouteSummary(`${leg.distance.text}, ${leg.duration.text}`);
          console.log("✅ Route rendered");
        } else {
          alert("Could not get directions: " + status);
        }
      }
    );
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    console.log("🧹 Cleared markers");
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current.set('directions', null);
      directionsRendererRef.current = null;
      destinationRef.current = null;
      setRouteSummary(null);
      console.log("🧼 Cleared route");
    }
  };

  return (
    <>
      <div id="floating-panel" className="search-bar">
        <input id="autocomplete-input" placeholder="Search for a place" style={{ padding: '8px', width: '200px' }} />

        <button onClick={getLocation}>📍 Locate Me</button>

        <select onChange={(e) => setRadius(Number(e.target.value))} value={radius}>
          {[1, 5, 10, 15, 20, 30, 50].map((km) => (
            <option key={km} value={km}>{km} km</option>
          ))}
        </select>

        <select onChange={(e) => setRouteType(e.target.value)} value={routeType}>
          <option value="DRIVING">Driving</option>
          <option value="WALKING">Walking</option>
          <option value="BICYCLING">Bicycling</option>
          <option value="TRANSIT">Transit</option>
        </select>

        <select onChange={(e) => setMinRating(Number(e.target.value))} value={minRating}>
          {[0, 3, 4, 4.5].map(r => (
            <option key={r} value={r}>Min Rating: {r}⭐</option>
          ))}
        </select>

        <label>
          <input type="checkbox" checked={openNow} onChange={() => setOpenNow(!openNow)} /> Open Now
        </label>

        <button onClick={clearMarkers}>🧹 Clear Markers</button>
        <button onClick={clearRoute}>🗺️ Clear Route</button>

        {routeSummary && <div style={{ marginLeft: '10px' }}>ETA: {routeSummary}</div>}
      </div>

      <div id="map" ref={mapRef} style={{ height: "100vh", width: "100%" }}></div>
    </>
  );
};

export default MapComponent;
