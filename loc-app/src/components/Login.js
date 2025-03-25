import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const gotToSignUp = () => {
    navigate('/signup');
  };
  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      console.log("Logged in user:", userCredential.user);
      alert("Login successful!");
      navigate('/'); // Redirect to home or dashboard
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', border: '1px solid #000' }}>
        <h3 className="text-center mb-4 text-dark">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Email</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              
            />
          </div>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Password</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-dark">Login</button>
          </div>
          <div className="d-grid" style={{marginTop:'20px'}}>
            <div className="btn btn-light" style={{border:'2px solid black'}} onClick={gotToSignUp}>Sign Up</div>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default Login;
