import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlobeView from './components/GlobeView';

const OPENCAGE_API_KEY = '5d7b2591ded44996a37ac21c77b58f13';

function App() {
  const [issPosition, setIssPosition] = useState({
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
    country: '',
    state: '',
  });
  const [path, setPath] = useState([]);

  useEffect(() => {
    const fetchISS = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/iss-location');
    const latitude = parseFloat(res.data.iss_position.latitude);
    const longitude = parseFloat(res.data.iss_position.longitude);

    console.log("ISS Position:", latitude, longitude);

    const geoRes = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
    );

    console.log("OpenCage Response:", geoRes.data);

    const components = geoRes.data.results[0]?.components || {};

    setIssPosition({
      latitude,
      longitude,
      velocity: res.data.velocity || 27574.10,
      altitude: res.data.altitude || 419.06,
      country: components.country || 'Unknown',
      state: components.state || components.region || 'Unknown',
    });

    setPath(prev => [...prev.slice(-19), [latitude, longitude]]);
  } catch (error) {
    console.error('Error fetching ISS or location data:', error);
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
