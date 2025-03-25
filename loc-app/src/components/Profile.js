import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseconfig';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc
} from 'firebase/firestore';

import {
  onAuthStateChanged,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logoutImg from '../assets/logout.png';
import back from '../assets/back.png';
import bcrypt from 'bcryptjs'; // At the top

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const goToHome = () => navigate('/');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const docRef = doc(db, "userDetails", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.warn("User profile document missing");
        }
      } catch (error) {
        console.error("Error loading profile:", error.message);
      }

      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [navigate]);


  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };


  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !userDetails) return;

    try {
      // Firestore references
      const userRef = doc(db, "userDetails", user.uid);
      const passwordHistoryCollection = collection(db, "oldPasswords", user.uid, "history");

      // 1. Update Firestore profile
      await updateDoc(userRef, {
        name: userDetails.name,
        dob: userDetails.dob,
        gender: userDetails.gender,
        city: userDetails.city,
        contact: userDetails.contact
      });

      // 2. Update display name
      await updateProfile(user, {
        displayName: userDetails.name
      });

      // 3. Check new password (if any)
      if (newPassword.length >= 6) {
        const querySnapshot = await getDocs(passwordHistoryCollection);
        const oldHashes = querySnapshot.docs.map(doc => doc.data().hash);

        // SAFER: Check each hash one-by-one
        for (let hash of oldHashes) {
          const match = await bcrypt.compare(newPassword, hash);
          if (match) {
            alert("You can't reuse an old password.");
            return;
          }
        }

        // Update password in Firebase Auth
        await updatePassword(user, newPassword);

        // Save new hash with timestamp
        const newHash = await bcrypt.hash(newPassword, 10);
        await addDoc(passwordHistoryCollection, {
          hash: newHash,
          timestamp: new Date()
        });

        alert("Password updated successfully.");
      }


      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Update failed: " + error.message);
    }
  };

  if (!authChecked) return <div className="text-center mt-5">Checking authentication...</div>;
  if (!userDetails) return <div className="text-center mt-5">Loading profile info...</div>;


  return (
    <div className="container text-center">
      {/* Top Bar */}
      <div className="row align-items-center position-relative">
        <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
          <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
        </div>

        <div className="col text-center">
          <h2 className="m-0">Edit Profile</h2>
        </div>

        <div className="col-auto">
          <img src={logoutImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
        </div>
      </div>
      <hr />

      <div className="container mt-4">
        <div className="card p-4 shadow border-dark" style={{ maxWidth: '600px', margin: 'auto' }}>
          <h3 className="text-center text-dark mb-4">Your Profile</h3>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">Full Name</label>
            <input name="name" value={userDetails.name} onChange={handleChange} className="form-control border-dark text-dark bg-light" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">Email</label>
            <input value={userDetails.email} disabled className="form-control border-dark text-muted bg-light" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">Date of Birth</label>
            <input type="date" name="dob" value={userDetails.dob} onChange={handleChange} className="form-control border-dark text-dark bg-light" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">Gender</label>
            <select name="gender" value={userDetails.gender} onChange={handleChange} className="form-select border-dark text-dark bg-light">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">City</label>
            <input name="city" value={userDetails.city} onChange={handleChange} className="form-control border-dark text-dark bg-light" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">Contact</label>
            <input name="contact" value={userDetails.contact} onChange={handleChange} className="form-control border-dark text-dark bg-light" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-dark">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="form-control border-dark text-dark bg-light"
            />
          </div>

          <div className="d-grid mt-3">
            <button className="btn btn-dark" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
