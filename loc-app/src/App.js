import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import locationImg from './assets/location.png';
import profileImg from './assets/profile.png';
import { auth } from './firebaseconfig'; // adjust path if needed
import { onAuthStateChanged } from 'firebase/auth';
import locImg from './assets/location.png';
import restImg from './assets/restaurant.png';
import locHistImg from './assets/location-history.png';

function App() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const goToMap = () => navigate('/map');
  const goToProfile = () => navigate('/profile');
  const goToNearByRestaurantsList = () => navigate('/nearbyrestaurantslist');

  if (!authChecked) {
    return <div className="text-center mt-5">Checking authentication...</div>;
  }

  return (
    <div className="container text-center">
      {/* Top Bar */}
      <div className="container text-center">
        {/* Top Bar */}
        <div className="row align-items-center position-relative" style={{marginTop:'20px'}}>
    

          <div className="col text-center">
            <h2 className="m-0">GeoFoodie</h2>
          </div>

          <div className="col-auto" style={{cursor:'pointer'}}>
            <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" onClick={goToProfile} />
          </div>
        </div>

        {/* Centered Cards Row */}
        <div className="d-flex justify-content-center mt-5">
          <div className="row" style={{ maxWidth: '1000px' }}>
            {/* Card 1 */}
            <div className='col-md-4 d-flex justify-content-center mb-4' onClick={goToMap}>
              <div className='card' style={{ width: '20rem', height: '25rem', cursor: 'pointer' }}>
                <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                  <h4 className='text-center mb-4'>Map</h4>
                  <img src={locImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className='col-md-4 d-flex justify-content-center mb-4' onClick={goToNearByRestaurantsList} >
              <div className='card' style={{ width: '20rem', height: '25rem' }}>
                <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                  <h4 className='text-center mb-4'>Dining</h4>
                  <img src={restImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className='col-md-4 d-flex justify-content-center mb-4'>
              <div className='card' style={{ width: '20rem', height: '25rem' }}>
                <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                  <h4 className='text-center mb-4'>Map</h4>
                  <img src={locHistImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
