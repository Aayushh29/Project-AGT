// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MapComponent from './components/MapComponent';
import Profile from './components/Profile';
import Signup from './components/SignUp';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import NearbyRestaurantsList from './components/NearByRestaurantsList';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/map" element={<MapComponent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/nearbyrestaurantslist" element={<NearbyRestaurantsList />} />
      {/* <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        /> */}
    </Routes>
  </BrowserRouter>
);
