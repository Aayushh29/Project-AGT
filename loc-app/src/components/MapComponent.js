import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './stylesheets/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';
import locpin from '../assets/location-pin.png';
import destpin from '../assets/destination-pin.png';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [user, setUser] = useState(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const hasPrompted = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();
  const auth = getAuth();

  const goToHome = () => navigate('/');
  const goToProfile = () => navigate('/profile');

  const visitedTodayRef = useRef(new Set());

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);
  useEffect(() => {
    hasPrompted.current = false;
    visitedTodayRef.current.clear(); // 💡 clear all previously visited entries
  }, [googleReady]);


  useEffect(() => {
    if (!googleReady) return;

    if (location.state?.destination) {
      destinationRef.current = location.state.destination;
      setRestaurantDetails(location.state?.meta ?? {
        name: 'Unknown',
        address: 'Unknown',
        rating: 'N/A',
        cuisine: 'Unknown'
      });

      getLocation();
    }
    else {
      getLocation(true);
    }
  }, [googleReady]);

  useEffect(() => {
    if (
      googleReady &&
      latLngRef.current &&
      mapRefObject.current &&
      destinationRef.current &&
      restaurantDetails &&
      user
    ) {
      getDirections(destinationRef.current.lat, destinationRef.current.lng);
      startProximityWatcher(); // ✅ Now runs ONLY when everything is loaded
    }
  }, [routeType, googleReady, restaurantDetails, user]);


  const getLocation = (searchNearest = false) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        latLngRef.current = coords;
        initMap(coords, searchNearest);
      },
      () => alert("Geolocation failed.")
    );
  };

  const initMap = (coords, searchNearest = false) => {

    const gmaps = window.google.maps;
    const mapObj = new gmaps.Map(mapRef.current, {
      center: coords,
      zoom: 14
    });

    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    userMarkerRef.current = new gmaps.Marker({
      position: coords,
      map: mapObj,
      title: "You are here",
      icon: {
        url: locpin,
        scaledSize: new gmaps.Size(40, 40)
      }
    });

    infowindowRef.current = new gmaps.InfoWindow({ content: "You are here!" });
    infowindowRef.current.open(mapObj);
    mapRefObject.current = mapObj;

    if (destinationRef.current) {
      placeDestinationMarker(destinationRef.current);
      getDirections(destinationRef.current.lat, destinationRef.current.lng);
    } else if (searchNearest) {
      findNearestRestaurant(coords);
    }
  };

  const findNearestRestaurant = (coords) => {
    const gmaps = window.google.maps;
    const service = new gmaps.places.PlacesService(mapRefObject.current);

    service.nearbySearch(
      {
        location: coords,
        radius: 3000,
        type: 'restaurant'
      },
      (results, status) => {
        if (status === gmaps.places.PlacesServiceStatus.OK && results.length > 0) {
          const nearest = results[0];
          const loc = nearest.geometry.location;
          const meta = {
            name: nearest.name || 'Unnamed Place',
            address: nearest.vicinity || 'Unknown',
            rating: nearest.rating || 'N/A',
            cuisine: nearest.types?.find(t => t.includes("restaurant") && t !== "restaurant")?.replace(/_/g, ' ') || 'Unknown Cuisine',
            photo: nearest.photos?.[0]?.getUrl({ maxWidth: 400 }) || null
          };

          destinationRef.current = { lat: loc.lat(), lng: loc.lng() };
          setRestaurantDetails(meta);
          placeDestinationMarker(destinationRef.current);
          getDirections(loc.lat(), loc.lng());
        }
      }
    );
  };
  const checkIfVisitedToday = async () => {
    if (!user || !restaurantDetails?.name) {
      console.warn("⚠️ Skipping check — missing user or restaurant name.", { user, restaurantDetails });
      return false;
    }

    const placeName = restaurantDetails.name;

    const visitsRef = collection(db, `visitHistory/${user.uid}/visits`);
    const snapshot = await getDocs(visitsRef, { source: 'server' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matched = false;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const ts = data.timestamp?.toDate?.();
      const visitDate = ts || new Date(data.timestamp);
      visitDate.setHours(0, 0, 0, 0);

      if (
        visitDate.getTime() === today.getTime() &&
        data.placeName === placeName
      ) {
        matched = true;
        break;
      }
    }

    if (matched) {
      console.log("✅ Visit already recorded for today:", placeName);
      visitedTodayRef.current.add(placeName);
      return true;
    } else {
      console.log("🔁 No visit recorded today for:", placeName);
      visitedTodayRef.current.delete(placeName);
      return false;
    }
  };


  const placeDestinationMarker = (destination) => {
    const gmaps = window.google.maps;
    if (destinationMarkerRef.current) destinationMarkerRef.current.setMap(null);
    destinationMarkerRef.current = new gmaps.Marker({
      position: destination,
      map: mapRefObject.current,
      title: "Destination",
      icon: {
        url: destpin,
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

        const bounds = new gmaps.LatLngBounds();
        result.routes[0].overview_path.forEach(p => bounds.extend(p));
        map.fitBounds(bounds);

        // ✅ Trigger proximity watch only after directions are loaded
        startProximityWatcher();
      } else {
        alert("Could not get directions: " + status);
      }
    });


  };

  const startProximityWatcher = () => {
    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const userPos = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      const destPos = new window.google.maps.LatLng(destinationRef.current.lat, destinationRef.current.lng);
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(userPos, destPos);

      console.log("📍 Proximity check:", { distance, restaurantDetails });

      if (distance < 100 && !hasPrompted.current) {

        // 🚨 Wait until restaurantDetails is fully loaded
        if (!restaurantDetails || !restaurantDetails.name || restaurantDetails.name === 'Unknown') {
          console.warn("⚠️ Skipping rating prompt — invalid restaurant details");
          navigator.geolocation.clearWatch(watchId);
          return;
        }

        const alreadyVisited = await checkIfVisitedToday();

        if (!alreadyVisited) {
          showRatingPrompt();
        } else {
          console.log("⛔ Already rated today, skipping prompt.");
        }

        navigator.geolocation.clearWatch(watchId); // Always clear watch
      }
    });
  };

  const [showModal, setShowModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);

  const showRatingPrompt = () => {
    if (!restaurantDetails || !restaurantDetails.name) {
      console.warn("🚫 Can't show rating prompt: restaurant details are missing.");
      return;
    }

    setShowModal(true); // show modal instead of prompt

    console.log("📍 Attempting to prompt for rating. Restaurant:", restaurantDetails);
    // const rating = prompt("You've arrived! How would you rate this place? (1–5)");
    // const parsed = parseInt(rating);
    // if (parsed >= 1 && parsed <= 5) {
    //   submitRating(parsed);
    //   visitedTodayRef.current.add(restaurantDetails.name);
    // }
  };
  const handleRatingSubmit = () => {
    if (pendingRating >= 1 && pendingRating <= 5) {
      submitRating(pendingRating);
      visitedTodayRef.current.add(restaurantDetails.name);
      setShowModal(false);
      setPendingRating(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        console.log("✅ Auth user detected:", firebaseUser.uid);
      } else {
        setUser(null);
        console.warn("🚫 No authenticated user.");
      }
    });

    return () => unsubscribe();
  }, []);


  const submitRating = async (rating) => {
    if (!user) {
      console.error("🚫 User not authenticated");
      return;
    }

    if (!restaurantDetails) {
      console.error("🚫 No restaurant details available. Skipping rating submission.");
      return;
    }

    const now = new Date();
    const visitId = `${Date.now()}`;
    const visitRef = doc(db, `visitHistory/${user.uid}/visits/${visitId}`);

    try {
      await setDoc(visitRef, {
        userId: user.uid,
        placeName: restaurantDetails.name,
        address: restaurantDetails.address,
        cuisine: restaurantDetails.cuisine,
        rating,
        timestamp: now
      });

      visitedTodayRef.current.add(restaurantDetails.name); // ⬅️ add here
      hasPrompted.current = true;
      alert('✅ Thanks for rating!');

    } catch (err) {
      console.error("🔥 Firestore write failed:", err.message);
    }
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current.set('directions', null);
      directionsRendererRef.current = null;
      destinationRef.current = null;
      setRouteSummary(null);
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }
  };

  return (
    <div className="container-fluid text-center">
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

      <div className="row" style={{ height: '85vh' }}>
        <div className="col-md-4 border-end p-3 text-start bg-light overflow-auto">
          <h4>Restaurant Details</h4>
          {restaurantDetails ? (
            <>
              {restaurantDetails.photo && (
                <img
                  src={restaurantDetails.photo}
                  alt="Restaurant"
                  style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
              )}
              <h5>{restaurantDetails.name}</h5>
              <p><strong>Address:</strong> {restaurantDetails.address}</p>
              <p><strong>Rating:</strong> {restaurantDetails.rating} ⭐</p>
              <p><strong>Cuisine:</strong> {restaurantDetails.cuisine}</p>
              {routeSummary && <p><strong>ETA:</strong> {routeSummary}</p>}
            </>
          ) : (
            <p>Loading restaurant info...</p>
          )}

          <hr />
          <button className="btn btn-dark w-100 mb-2" onClick={() => getLocation(true)}>📍 Locate Me</button>
          <select
            className="form-select mb-2"
            value={routeType}
            onChange={(e) => setRouteType(e.target.value)}
          >
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Bicycling</option>
            <option value="TRANSIT">Transit</option>
          </select>
          <button className="btn btn-outline-danger w-100" onClick={clearRoute}>🧹 Clear Route</button>
        </div>

        <div className="col-md-8 position-relative">
          <div ref={mapRef} className='rounded' style={{ height: "100%", width: "100%", border: '2px solid black' }}></div>
        </div>
        {showModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Rate {restaurantDetails?.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body text-center">
                  <p>How would you rate this place?</p>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`btn m-1 ${pendingRating === num ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setPendingRating(num)}
                    >
                      {num} ⭐
                    </button>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-success" onClick={handleRatingSubmit} disabled={!pendingRating}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MapComponent;