import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [issPosition, setIssPosition] = useState({ latitude: 0, longitude: 0 });
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
        setIssPosition({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        });
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
      {/* Left Side - Info */}
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

      {/* Right Side - Map */}
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
          <Marker position={[issPosition.latitude, issPosition.longitude]}>
            <Popup>
              ISS Current Position<br />
              Lat: {issPosition.latitude.toFixed(2)}<br />
              Long: {issPosition.longitude.toFixed(2)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
