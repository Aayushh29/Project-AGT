import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const goToSignUp = () => {
    navigate('/signup');
  };
  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
  
      console.log("Logged in user:", userCredential.user);
      alert("Login successful!");
      navigate('/');
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!loginData.email) {
      alert("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, loginData.email);
      alert("Password reset email sent!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google user:", result.user);
      alert("Logged in with Google!");
      navigate('/');
    } catch (error) {
      alert("Google login failed: " + error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', border: '1px solid #000' }}>
        <h3 className="text-center mb-4 text-dark">Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3 text-start">
            <label className="form-label text-dark">Email</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
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
              value={loginData.password}
              onChange={handleChange}
              className="form-control border-dark text-dark bg-light"
              required
            />
          </div>
          <div className="form-check mb-3 text-start">
            <input
              className="form-check-input"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              id="rememberMeCheck"
            />
            <label className="form-check-label text-dark" htmlFor="rememberMeCheck">
              Remember Me
            </label>
          </div>
          <div className="d-grid mb-2">
            <button type="submit" className="btn btn-dark">Login</button>
          </div>
        </form>

        <button className="btn btn-link text-dark p-0 mb-3" onClick={handleForgotPassword}>
          Forgot Password?
        </button>
        <button className="btn btn-link text-dark p-0 mb-3" onClick={goToSignUp}>
          Sign Up
        </button>

        <hr />
        <button className="btn btn-outline-dark w-100" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
