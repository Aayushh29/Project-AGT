import React, { useEffect, useState, useRef } from 'react';
import './style.css';

const NearbySearch = () => {
  const mapRef = useRef(null);
  const [radius, setRadius] = useState(10);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        const params = new URLSearchParams({
          key: "ADD_YOUR_KEY",
          libraries: "geometry",
          v: "beta",
          callback: "initMap"
        });
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.error("Google Maps failed to load.");
        document.head.appendChild(script);
      }
    };

    window.initMap = () => {
      console.log("Google Maps script loaded.");
      // You can initialize the map here, or in a separate effect
    };

    loadGoogleMapsScript();
  }, []);

  return (
    <>
      <div id="floating-panel">
        <input
          id="submit"
          type="button"
          value="Locate Me"
          onClick={() => console.log("Locate Me Clicked")}
        />

        <div className="slidecontainer">
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            className="slider"
            id="radius"
            onChange={(e) => setRadius(e.target.value)}
          />
          <p>Value: <span id="demo">{radius}</span></p>
        </div>

        <select id="routeType">
          <option value="DRIVING">Driving</option>
          <option value="WALKING">Walking</option>
          <option value="BICYCLING">Bicycling</option>
          <option value="TRANSIT">Transit</option>
        </select>
      </div>

      <div id="map" ref={mapRef} style={{ height: '100vh' }}></div>
    </>
  );
};

export default NearbySearch;
