import React, { useEffect, useState } from 'react';
import GlobeView from './components/GlobeView';
import axios from 'axios';

function App() {
  const [issPosition, setIssPosition] = useState({
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
  });
  const [path, setPath] = useState([]);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/iss-location');
        const latitude = parseFloat(res.data.iss_position.latitude);
        const longitude = parseFloat(res.data.iss_position.longitude);

        setIssPosition({
          latitude,
          longitude,
          velocity: res.data.velocity || 27574.10,
          altitude: res.data.altitude || 419.06,
        });

        setPath(prev => [...prev.slice(-19), [latitude, longitude]]);
      } catch (error) {
        console.error('Failed to fetch ISS data:', error);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlobeView issPosition={issPosition} path={path} />
  );
}

export default App;
