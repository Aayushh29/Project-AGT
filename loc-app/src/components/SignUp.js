import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseconfig'; // Adjust path if needed
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const gotToSignIn = () => {
    navigate('/login');
  };
  const handleChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = signupData;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      alert("User created successfully!");
      console.log("Firebase user:", userCredential.user);
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%', backgroundColor: '#fff', border: '1px solid #000' }}>
        <h3 className="text-center mb-4 text-dark">Create Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Full Name</label>
            <input
              type="text"
              name="name"
              value={signupData.name}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Email</label>
            <input
              type="email"
              name="email"
              value={signupData.email}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Password</label>
            <input
              type="password"
              name="password"
              value={signupData.password}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              required
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={signupData.confirmPassword}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-dark">Sign Up</button>
          </div>
          <div className="d-grid" style={{marginTop:'20px'}}>
            <div className="btn btn-light" style={{border:'2px solid black'}} onClick={gotToSignIn}>Sign In</div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
