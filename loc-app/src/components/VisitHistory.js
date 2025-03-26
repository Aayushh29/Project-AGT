import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './stylesheets/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const { isLoaded: googleReady } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const goToHome = () => navigate('/');
  const goToProfile = () => navigate('/profile');

  useEffect(() => {
    const fetchVisitHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);

          const visitsRef = collection(db, `visitHistory/${user.uid}/visits`);
          const snapshot = await getDocs(visitsRef);

          const data = snapshot.docs.map(doc => {
            const visit = doc.data();
            return {
              id: doc.id,
              ...visit,
              timestamp: visit.timestamp?.toDate?.().toLocaleString() || 'Unknown'
            };
          });

          setVisits(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
          setLoading(false);
        }, () => {
          console.warn("Failed to get user location.");
          setLoading(false);
        });

      } catch (err) {
        console.error("Failed to fetch visit history:", err.message);
        setLoading(false);
      }
    };

    fetchVisitHistory();
  }, []);

  return (
    <div className="container-fluid text-center">
      <div className="row align-items-center position-relative">
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
          <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
        </div>

        <div className="col text-center">
          <h2 className="m-0">Visit History</h2>
        </div>

        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToProfile}>
          <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
        </div>
      </div>
      <hr />

      <div className="row" style={{ height: '80vh' }}>
        {/* Left Panel: Visit List */}
        <div className="col-md-4 border-end p-3 text-start bg-light overflow-auto">
          <h5 className="mb-3 text-center">Places You've Visited</h5>
          {loading ? (
            <p>Loading...</p>
          ) : visits.length === 0 ? (
            <p>No visit history found.</p>
          ) : (
            <div className="list-group" style={{border:'2px solid black'}}>
              {visits.map((visit) => (
                <div key={visit.id} className="list-group-item">
                  <h6 className="mb-1">{visit.placeName}</h6>
                  <p className="mb-1 text-muted">{visit.address}</p>
                  <small className="text-muted">
                    ⭐ {visit.rating} • {visit.cuisine} • {visit.timestamp}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Map */}
        <div className="col-md-8 p-0">
          {googleReady && userLocation && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={userLocation}
              zoom={13}
            >
              {/* User Location Marker */}
              <Marker
                position={userLocation}
                title="You are here"
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />

              {/* Visited Restaurants Markers */}
              {visits.map((visit) =>
                visit.lat && visit.lng ? (
                  <Marker
                    key={visit.id}
                    position={{ lat: visit.lat, lng: visit.lng }}
                    title={visit.placeName}
                  />
                ) : null
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitHistory;
