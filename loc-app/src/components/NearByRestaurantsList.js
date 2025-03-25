import React, { useEffect, useRef, useState } from 'react';
import './stylesheets/style.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';
import locpin from '../assets/location-pin.png'

const NearByRestaurantsList = () => {
  const [visiblePlaces, setVisiblePlaces] = useState([]);
  const [radius, setRadius] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const latLngRef = useRef(null);
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const handleClick = (place) => {
    navigate('/map', {
      state: {
        destination: place.position,
        meta: {
          name: place.name,
          address: place.address,
          rating: place.rating,
          cuisine: place.cuisine
        }
      }
    });
      };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps loaded");
      getLocation();
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (latLngRef.current) {
      fetchNearby(latLngRef.current);
    }
  }, [radius, minRating]);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        latLngRef.current = userLatLng;
        fetchNearby(userLatLng);
      },
      () => alert("Geolocation failed.")
    );
  };

  const fetchNearby = (coords) => {
    setLoading(true);
    const gmaps = window.google.maps;
    const map = new gmaps.Map(document.createElement("div"));
    const service = new gmaps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: coords,
        radius: radius * 1000,
        type: "restaurant"
      },
      (results, status) => {
        if (status !== gmaps.places.PlacesServiceStatus.OK || !results) {
          alert("No nearby restaurants found.");
          setVisiblePlaces([]);
          setLoading(false);
          return;
        }

        const origin = new gmaps.LatLng(coords.lat, coords.lng);

        const places = results.map(place => {
          if (!place.geometry?.location || place.rating < minRating) return null;

          const distanceMeters = gmaps.geometry.spherical.computeDistanceBetween(
            origin,
            place.geometry.location
          );

          const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 100 }) || "https://via.placeholder.com/100";
          const cuisine = place.types?.filter(t => t.includes("restaurant") && t !== "restaurant")[0]?.replace(/_/g, ' ') || "Unknown Cuisine";

          return {
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            distance: (distanceMeters / 1000).toFixed(2),
            photo: photoUrl,
            cuisine,
            position: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          };
        }).filter(Boolean);

        setVisiblePlaces(places);
        setLoading(false);
      }
    );
  };

  return (
    <div className="container text-center">
      <div className="row align-items-center position-relative">
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
          <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
        </div>

        <div className="col text-center">
          <h2 className="m-0">Nearby Restaurants</h2>
        </div>

        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToProfile}>
          <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
        </div>
      </div>
      <hr />

      <div className="container mb-4">
        <div className="row g-3">
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold">Filter by Radius (km)</label>
            <select className="form-select" style={{backgroundColor:"black", color:'white'}}  value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
              {[1, 3, 5, 10, 15, 20, 30, 50].map(r => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>
          </div>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold">Minimum Rating</label>
            <select className="form-select" style={{backgroundColor:"black", color:'white'}} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              {[0, 3, 4, 4.5].map(r => (
                <option key={r} value={r}>{r} ⭐</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mt-4" style={{ maxWidth: '700px' }}>
        <h4 className="mb-3 text-start">Restaurants Found: {loading ? 'Loading...' : visiblePlaces.length}</h4>
        <div className="list-group">
          {visiblePlaces.map((place, index) => (
            <div
              key={index}
              className="list-group-item list-group-item-action d-flex align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(place)}
            >
              <img
                src={place.photo}
                alt="restaurant"
                className="me-3"
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div className="text-start">
                <h5 className="mb-1">{place.name}</h5>
                <p className="mb-1 text-muted">{place.address}</p>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <span className="badge bg-secondary">{place.cuisine}</span>
                  <small className="text-muted">Rating: {place.rating || 'N/A'} ⭐</small>
                  <small className="text-muted">• {place.distance} km away</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearByRestaurantsList;