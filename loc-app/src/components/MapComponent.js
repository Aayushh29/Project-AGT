import React, { useEffect, useRef, useState } from 'react';
import './stylesheets/style.css';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapRefObject = useRef(null);
  const [routeType, setRouteType] = useState("DRIVING");
  const [googleReady, setGoogleReady] = useState(false);
  const directionsRendererRef = useRef(null);
  const destinationRef = useRef(null);
  const latLngRef = useRef(null);
  const infowindowRef = useRef(null);
  const [routeSummary, setRouteSummary] = useState(null);
  const [destinationStateReady, setDestinationStateReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const goToHome = () => navigate('/');
  const goToProfile = () => navigate('/profile');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleReady) return;

    if (location.state?.destination) {
      destinationRef.current = location.state.destination;
      setDestinationStateReady(true);
    }

    getLocation();
  }, [googleReady]);

  useEffect(() => {
    if (
      googleReady &&
      destinationStateReady &&
      latLngRef.current &&
      mapRefObject.current &&
      destinationRef.current
    ) {
      placeDestinationMarker(destinationRef.current);
      getDirections(destinationRef.current.lat, destinationRef.current.lng);
      setDestinationStateReady(false);
    }
  }, [googleReady, destinationStateReady]);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        latLngRef.current = coords;
        initMap(coords);
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

    infowindowRef.current = new gmaps.InfoWindow({ content: "You are here!" });
    infowindowRef.current.open(mapObj);
    mapRefObject.current = mapObj;

    if (destinationRef.current) {
      placeDestinationMarker(destinationRef.current);
      getDirections(destinationRef.current.lat, destinationRef.current.lng);
    }
  };

  const placeDestinationMarker = (destination) => {
    const gmaps = window.google.maps;
    new gmaps.Marker({
      position: destination,
      map: mapRefObject.current,
      title: "Destination",
      icon: {
        url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        scaledSize: new gmaps.Size(40, 40)
      }
    });
  };

  const getDirections = (destLat, destLng) => {
    const gmaps = window.google.maps;
    const map = mapRefObject.current;
    if (!latLngRef.current || !map) return;

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

    directionsService.route({
      origin: start,
      destination: end,
      travelMode: gmaps.TravelMode[routeType]
    }, (result, status) => {
      if (status === gmaps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
        infowindowRef.current?.close();
        const leg = result.routes[0].legs[0];
        setRouteSummary(`${leg.distance.text}, ${leg.duration.text}`);
      } else {
        alert("Could not get directions: " + status);
      }
    });
  };

  return (
    <div className="container text-center">
      <div className="row align-items-center position-relative">
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
          <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
        </div>
        <div className="col text-center">
          <h2 className="m-0">Map</h2>
        </div>
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToProfile}>
          <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
        </div>
      </div>
      <hr />

      <div style={{ display: 'flex', height: '90vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div id="map" ref={mapRef} className='rounded' style={{ height: "100%", width: "100%", border: '2px solid black' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;