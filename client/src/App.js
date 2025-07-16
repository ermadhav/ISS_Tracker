import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import issIconImage from './assets/iss-icon.png'; // make sure this path is correct

// Create custom ISS icon
const issIcon = new L.Icon({
  iconUrl: issIconImage,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -20],
});

function App() {
  const [issPosition, setIssPosition] = useState({ latitude: 0, longitude: 0 });
  const [issPath, setIssPath] = useState([]);
  const [isTracking, setIsTracking] = useState(true);

  const [info, setInfo] = useState({
    country: 'Indonesia',
    state: 'South Papua',
    velocity: 27574.10,
    altitude: 419.06
  });

  useEffect(() => {
    const fetchIssLocation = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/iss-location');
        const { latitude, longitude } = res.data.iss_position;

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        setIssPosition({ latitude: lat, longitude: lon });

        // Add to path for polyline
        setIssPath(prevPath => [...prevPath.slice(-19), [lat, lon]]);
      } catch (error) {
        console.error('Error fetching ISS location:', error);
      }
    };

    fetchIssLocation();
    let interval = setInterval(() => {
      if (isTracking) fetchIssLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const stopTracking = () => setIsTracking(false);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        padding: '30px',
        backgroundColor: '#f0f2f5',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
      }}>
        <h2>TRACK THE INTERNATIONAL SPACE STATION</h2>
        <p><strong>Country:</strong> {info.country}</p>
        <p><strong>State:</strong> {info.state}</p>
        <p><strong>Latitude:</strong> {issPosition.latitude.toFixed(4)}</p>
        <p><strong>Longitude:</strong> {issPosition.longitude.toFixed(4)}</p>
        <p><strong>Velocity:</strong> {info.velocity} kmph</p>
        <p><strong>Altitude:</strong> {info.altitude} km</p>
        <button onClick={stopTracking} style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          STOP TRACKING
        </button>
      </div>

      {/* Right Panel - Map */}
      <div style={{ flex: 2 }}>
        <MapContainer
          center={[issPosition.latitude, issPosition.longitude]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* ISS Marker */}
          <Marker
            position={[issPosition.latitude, issPosition.longitude]}
            icon={issIcon}
          >
            <Popup>
              ISS Current Position<br />
              Lat: {issPosition.latitude.toFixed(2)}<br />
              Long: {issPosition.longitude.toFixed(2)}
            </Popup>
          </Marker>

          {/* Polyline for path */}
          <Polyline
            positions={issPath}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
