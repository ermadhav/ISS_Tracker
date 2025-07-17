// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlobeView from './components/GlobeView';

const OPENCAGE_API_KEY = '5d7b2591ded44996a37ac21c77b58f13'; // Replace with real key

function App() {
  const [issPosition, setIssPosition] = useState({
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
    country: 'Loading...',
    state: '',
  });

  const [path, setPath] = useState([]);
  const [email, setEmail] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  const fetchISS = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/iss-location');
      const latitude = parseFloat(res.data.iss_position.latitude);
      const longitude = parseFloat(res.data.iss_position.longitude);

      const geoRes = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
      );

      const components = geoRes.data.results[0]?.components || {};
      const country = components.country || 'International Waters';
      const state = components.state || components.region || '';

      setIssPosition({
        latitude,
        longitude,
        velocity: res.data.velocity || 27574.1,
        altitude: res.data.altitude || 419.06,
        country,
        state,
      });

      setPath((prev) => [...prev.slice(-19), [longitude, latitude]]);

      // Check for visibility and send email
      if (userLocation && email) {
        await axios.post('http://localhost:5000/api/check-visibility', {
          userLat: userLocation.latitude,
          userLng: userLocation.longitude,
          email,
        }).then(res => {
          setMessage(res.data.message);
        });
      }

    } catch (error) {
      console.error('Failed to fetch ISS or geolocation data:', error);
    }
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 10000);
    return () => clearInterval(interval);
  }, [userLocation, email]);

  return (
    <div>
      <GlobeView issPosition={issPosition} path={path} />
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        background: 'rgba(255,255,255,0.1)',
        padding: '16px', borderRadius: '12px',
        color: '#fff', backdropFilter: 'blur(10px)', zIndex: 1000,
        maxWidth: '340px'
      }}>
        <h4>🔔 Get ISS Alerts</h4>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '8px', borderRadius: '6px',
            border: 'none', marginBottom: '8px'
          }}
        />
        {message && <p style={{ color: 'lightgreen', marginTop: 4 }}>{message}</p>}
      </div>
    </div>
  );
}

export default App;
