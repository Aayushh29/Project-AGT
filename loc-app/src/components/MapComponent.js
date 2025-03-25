import React, { useEffect, useRef, useState } from 'react';
import './stylesheets/style.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapRefObject = useRef(null);
  const [radius, setRadius] = useState(10);
  const [routeType, setRouteType] = useState("DRIVING");
  const [googleReady, setGoogleReady] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [showRadius, setShowRadius] = useState(false);
  const [visiblePlaces, setVisiblePlaces] = useState([]);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const destinationRef = useRef(null);
  const latLngRef = useRef(null);
  const infowindowRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const circleRef = useRef(null);

  const navigate = useNavigate();

  const goToMap = () => {
    navigate('/map');
  };

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

      if (latLngRef.current) {
        const bounds = new window.google.maps.LatLngBounds(
          {
            lat: latLngRef.current.lat - 0.2,
            lng: latLngRef.current.lng - 0.2
          },
          {
            lat: latLngRef.current.lat + 0.2,
            lng: latLngRef.current.lng + 0.2
          }
        );
        autocomplete.setBounds(bounds);
        autocomplete.setOptions({ strictBounds: true });
      }

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

  useEffect(() => {
    if (latLngRef.current && mapRefObject.current) {
      searchNearby(mapRefObject.current, latLngRef.current);
    }
  }, [minRating, openNow, radius, showRadius]);

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
      icon: {
        url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
        scaledSize: new gmaps.Size(40, 40)
      }
    });

    const iw = new gmaps.InfoWindow({ content: "You are here!" });
    iw.open(mapObj);
    infowindowRef.current = iw;
    mapRefObject.current = mapObj;

    drawCircle(mapObj, coords);
    searchNearby(mapObj, coords);
  };

  const drawCircle = (mapObj, center) => {
    const gmaps = window.google.maps;
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    if (showRadius) {
      circleRef.current = new gmaps.Circle({
        strokeColor: "#007bff",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#007bff",
        fillOpacity: 0.2,
        map: mapObj,
        center: center,
        radius: radius * 1000
      });
    }
  };

  const searchNearby = (mapObj, coords) => {
    const gmaps = window.google.maps;
    const service = new gmaps.places.PlacesService(mapObj);

    const request = {
      location: coords,
      radius: radius * 1000,
      type: "restaurant"
    };

    if (openNow) {
      request.openNow = true;
    }

    clearMarkers();
    drawCircle(mapObj, coords);

    service.nearbySearch(request, (results, status) => {
      if (status !== gmaps.places.PlacesServiceStatus.OK || !results) {
        alert("No nearby restaurants found.");
        return;
      }

      const newMarkers = [];
      const visible = [];

      const origin = new gmaps.LatLng(coords.lat, coords.lng);

      results.forEach((place) => {
        if (!place.geometry?.location || place.rating < minRating) return;

        const distanceMeters = gmaps.geometry.spherical.computeDistanceBetween(
          origin,
          place.geometry.location
        );

        const distanceKm = distanceMeters / 1000;

        if (distanceKm > radius) return;
        if (circleRef.current && !circleRef.current.getBounds().contains(place.geometry.location)) return;

        const marker = new gmaps.Marker({
          map: mapObj,
          position: place.geometry.location,
          title: place.name,
          animation: gmaps.Animation.DROP,
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
            scaledSize: new gmaps.Size(32, 32)
          }
        });

        marker.addListener("click", () => openInfoWindow(place, place.geometry.location));

        visible.push({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          distance: distanceKm.toFixed(2),
          marker,
          place,
          position: place.geometry.location
        });

        newMarkers.push(marker);
      });

      markersRef.current = newMarkers;
      setVisiblePlaces(visible);
    });
  };


  const openInfoWindow = (place, position) => {
    const gmaps = window.google.maps;
    if (!latLngRef.current) {
      alert("Please click 'Locate Me' first.");
      return;
    }

    const directionsService = new gmaps.DirectionsService();

    directionsService.route(
      {
        origin: new gmaps.LatLng(latLngRef.current.lat, latLngRef.current.lng),
        destination: position,
        travelMode: gmaps.TravelMode[routeType]
      },
      (result, status) => {
        if (status === gmaps.DirectionsStatus.OK) {
          const leg = result.routes[0].legs[0];

          const stars = place.rating
            ? '⭐'.repeat(Math.floor(place.rating)) + ` (${place.rating.toFixed(1)})`
            : 'No rating';

          const contentDiv = document.createElement("div");
          contentDiv.style.width = "250px";
          contentDiv.style.textAlign = "center";

          const name = document.createElement("h3");
          name.innerText = place.name;

          if (place.photos && place.photos.length > 0) {
            const img = document.createElement("img");
            img.src = place.photos[0].getUrl({ maxWidth: 250 });
            img.alt = place.name;
            img.style = "width: 100%; border-radius: 8px; margin-bottom: 10px;";
            contentDiv.appendChild(img);
          }

          const rating = document.createElement("p");
          rating.innerHTML = `<strong>Rating:</strong> ${stars}`;

          const dist = document.createElement("p");
          dist.innerHTML = `<strong>ETA:</strong> ${leg.distance.text}, ${leg.duration.text}`;

          const addr = document.createElement("p");
          addr.innerHTML = `<strong>Address:</strong> ${place.vicinity || 'N/A'}`;

          const btn = document.createElement("button");
          btn.innerText = "Get Directions";
          btn.style = "padding: 10px; margin-top: 10px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;";
          btn.addEventListener("click", () => {
            getDirections(position.lat(), position.lng());
          });
          contentDiv.appendChild(name);
          contentDiv.appendChild(rating);
          contentDiv.appendChild(dist);
          contentDiv.appendChild(addr);
          contentDiv.appendChild(btn);

          infowindowRef.current.setContent(contentDiv);
          infowindowRef.current.setPosition(position);
          infowindowRef.current.open(mapRefObject.current);
        } else {
          alert("Failed to fetch ETA for popup: " + status);
        }
      }
    );
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
        } else {
          alert("Could not get directions: " + status);
        }
      }
    );
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    setVisiblePlaces([]);
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current.set('directions', null);
      directionsRendererRef.current = null;
      destinationRef.current = null;
      setRouteSummary(null);
    }
  };

  return (
    <div className="container text-center">
      <div className="row align-items-center position-relative">
        {/* Image at top-left */}
        <div className="col-auto">
          <img src={back} style={{ width: '2rem', height: '2rem' }} alt="Back" />
        </div>

        {/* Centered "Map" text */}
        <div className="col text-center">
          <h4 className="m-0">Map</h4>
        </div>
      </div>
      <hr />

      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '25%', overflowY: 'auto' }}>
          <h4>Nearby Restaurants ({visiblePlaces.length})</h4>
          <ul>
            {visiblePlaces.map((place, i) => (
              <li key={i} style={{ marginBottom: '10px', cursor: 'pointer' }}
                onMouseEnter={() => place.marker.setAnimation(window.google.maps.Animation.BOUNCE)}
                onMouseLeave={() => place.marker.setAnimation(null)}
                onClick={() => openInfoWindow(place.place, place.position)}>
                <strong>{place.name}</strong><br />
                {place.rating}⭐ — {place.distance} km
                <hr />
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <div id="" className="btn btn-dark" style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, padding: '10px', borderRadius: '8px', boxShadow: '0px 2px 6px rgba(0,0,0,0.2)' }}>
            <button className='btn btn-light' onClick={getLocation}>📍 Locate Me</button>

            <div className="container mt-4">
              <div className="row g-3">
                {/* Radius Dropdown */}
                <div className="col-md-4">
                  <label htmlFor="radiusSelect" className="form-label fw-bold">Search Radius</label>
                  <select
                    id="radiusSelect"
                    className="form-select"
                    onChange={(e) => setRadius(Number(e.target.value))}
                    value={radius}
                  >
                    {[1, 5, 10, 15, 20, 30, 50].map((km) => (
                      <option key={km} value={km}>{km} km</option>
                    ))}
                  </select>
                </div>

                {/* Route Type Dropdown */}
                <div className="col-md-4">
                  <label htmlFor="routeTypeSelect" className="form-label fw-bold">Route Type</label>
                  <select
                    id="routeTypeSelect"
                    className="form-select"
                    onChange={(e) => setRouteType(e.target.value)}
                    value={routeType}
                  >
                    <option value="DRIVING">Driving</option>
                    <option value="WALKING">Walking</option>
                    <option value="BICYCLING">Bicycling</option>
                    <option value="TRANSIT">Transit</option>
                  </select>
                </div>

                {/* Rating Dropdown */}
                <div className="col-md-4">
                  <label htmlFor="ratingSelect" className="form-label fw-bold">Minimum Rating</label>
                  <select
                    id="ratingSelect"
                    className="form-select"
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    value={minRating}
                  >
                    {[0, 3, 4, 4.5].map((r) => (
                      <option key={r} value={r}>Min Rating: {r} ⭐</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>


            <button className='btn btn-light' onClick={clearMarkers}>🧹 Clear Markers</button>
            <button className='btn btn-light' onClick={clearRoute}>🗺️ Clear Route</button>

            {routeSummary && <div style={{ marginLeft: '10px' }}>ETA: {routeSummary}</div>}
          </div>

          <div id="map" ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
    </div>

  );
};

export default MapComponent;