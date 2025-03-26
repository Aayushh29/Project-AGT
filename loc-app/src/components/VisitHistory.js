import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './stylesheets/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import back from '../assets/back.png';
import profileImg from '../assets/profile.png';
import locpin from '../assets/location-pin.png'

const VisitHistory = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    const goToProfile = () => {
        navigate('/profile');
    };
    useEffect(() => {
        const fetchVisitHistory = async () => {
            const user = auth.currentUser;
            if (!user) {
                console.warn("User not logged in.");
                setLoading(false);
                return;
            }

            try {
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
            } catch (err) {
                console.error("Failed to fetch visit history:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitHistory();
    }, []);

    return (
        <div className="container text-center">
            <div className="row align-items-center position-relative">
                <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToHome}>
                    <img src={back} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Back" />
                </div>

                <div className="col text-center">
                    <h2 className="m-0">Nearby Restaurants</h2>
                </div>

                <div className="col-auto" style={{ cursor: 'pointer' }} onClick={goToProfile}>
                    <img src={profileImg} style={{ width: '2rem', height: '2rem', margin: '10px' }} alt="Profile" />
                </div>
            </div>
            <hr />
            <div className="container mt-4">
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : visits.length === 0 ? (
                    <p className="text-center">No visit history found.</p>
                ) : (
                    <div className="list-group">
                        {visits.map((visit) => (
                            <div key={visit.id} className="list-group-item">
                                <h5 className="mb-1">{visit.placeName}</h5>
                                <p className="mb-1 text-muted">{visit.address}</p>
                                <small className="text-muted">
                                    Rated: {visit.rating} ⭐ • {visit.cuisine} • {visit.timestamp}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitHistory;
