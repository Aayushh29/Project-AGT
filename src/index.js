// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MapComponent from './components/MapComponent';
import Profile from './components/Profile';
import Signup from './components/SignUp';
import Login from './components/Login';
import NearbyRestaurantsList from './components/NearByRestaurantsList';
import VisitHistory from './components/VisitHistory';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/map" element={<MapComponent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/history" element={<VisitHistory />} />
      <Route path="/nearbyrestaurantslist" element={<NearbyRestaurantsList />} />
    </Routes>
  </HashRouter>

);
