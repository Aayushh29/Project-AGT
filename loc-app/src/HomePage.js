import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import locationImg from './assets/location.png';
import profileImg from './assets/profile.png';

function HomePage() {
  const navigate = useNavigate();

  const goToMap = () => {
    navigate('/map');
  };

  const goToProfile = () => {
    navigate('/signup');
  };

  return (
    <div className="container py-5 text-center">
      <h1 className="mb-4">App Name</h1>
      <div onClick={goToProfile} style={{cursor:'pointer'}}>
        <img src={profileImg} style={{ width: '2rem', height: '2rem' }} alt="Profile" />
        <h4 className='mb-4 text-secondary'>Profile </h4>
      </div>
      <hr />

      {/* Centered Cards Row */}
      <div className="d-flex justify-content-center mt-5">
        <div className="row" style={{ maxWidth: '1000px' }}>
          {/* Card 1 */}
          <div className='col-md-4 d-flex justify-content-center mb-4' onClick={goToMap}>
            <div className='card' style={{ width: '20rem', height: '25rem', cursor: 'pointer' }}>
              <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                <h4 className='text-center mb-4'>Map</h4>
                <img src={locationImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className='col-md-4 d-flex justify-content-center mb-4'>
            <div className='card' style={{ width: '20rem', height: '25rem' }}>
              <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                <h4 className='text-center mb-4'>Map</h4>
                <img src={locationImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className='col-md-4 d-flex justify-content-center mb-4'>
            <div className='card' style={{ width: '20rem', height: '25rem' }}>
              <div className='card-body d-flex flex-column justify-content-center align-items-center'>
                <h4 className='text-center mb-4'>Map</h4>
                <img src={locationImg} alt="Placeholder" style={{ width: '2rem', height: '2rem' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
