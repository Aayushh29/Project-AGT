import React, { useState } from 'react';
import './stylesheets/style.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';

function Profile() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/');
  };

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Profile:', profile);
    alert("Profile updated!");
  };

  return (
    <div className="container text-center">
      {/* Top Bar */}
      <div className="row align-items-center position-relative">
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
          <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
        </div>

        <div className="col text-center">
          <h2 className="m-0">Profile</h2>
        </div>

        <div className="col-auto">
          <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
        </div>
      </div>
      <hr />

      {/* Update Profile Form */}
      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow-lg p-4 mb-5" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#fff', border: '1px solid #000' }}>
          <h3 className="text-center mb-4 text-dark">Update Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label text-dark">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="form-control border-dark text-dark bg-light"
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label text-dark">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="form-control border-dark text-dark bg-light"
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label text-dark">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="form-control border-dark text-dark bg-light"
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label text-dark">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="form-control border-dark text-dark bg-light"
                rows="3"
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-dark">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
