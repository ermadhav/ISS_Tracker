// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlobeView from './components/GlobeView';

const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY'; // Replace this with your real key

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

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/iss-location');
        const latitude = parseFloat(res.data.iss_position.latitude);
        const longitude = parseFloat(res.data.iss_position.longitude);

        // Reverse geocode using OpenCage
        const geoRes = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
        );

        const components = geoRes.data.results[0]?.components || {};
        const country = components.country || 'International Waters';
        const state = components.state || components.region || '';

        setIssPosition({
          latitude,
          longitude,
          velocity: res.data.velocity || 27574.10,
          altitude: res.data.altitude || 419.06,
          country,
          state,
        });

        setPath((prev) => [...prev.slice(-19), [longitude, latitude]]);
      } catch (error) {
        console.error('Failed to fetch ISS or geolocation data:', error);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  return <GlobeView issPosition={issPosition} path={path} />;
}

export default App;
