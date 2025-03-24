import React, { useEffect, useRef } from "react";

const TestMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => initMap();
    document.body.appendChild(script);
  }, []);

  const initMap = () => {
    const gmaps = window.google.maps;

    const origin = { lat: 43.65107, lng: -79.347015 }; // Toronto
    const destination = { lat: 43.653908, lng: -79.384293 }; // Another spot in Toronto

    const map = new gmaps.Map(mapRef.current, {
      zoom: 14,
      center: origin,
    });

    const directionsService = new gmaps.DirectionsService();
    const directionsRenderer = new gmaps.DirectionsRenderer({
      map: map,
    });

    directionsService.route(
      {
        origin,
        destination,
        travelMode: gmaps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log("Route status:", status);
        if (status === gmaps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          alert("Route failed: " + status);
        }
      }
    );
  };

  return (
    <div>
      <h2>Directions Test</h2>
      <div ref={mapRef} style={{ height: "90vh", width: "100%" }}></div>
    </div>
  );
};

export default TestMap;
