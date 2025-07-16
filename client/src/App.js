import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GlobeView from './components/GlobeView';
import L from 'leaflet';
import issIconImg from './assets/iss-icon.png';

const issIcon = new L.Icon({
  iconUrl: issIconImg,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -20],
});

function App() {
  const [pos, setPos] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [view3D, setView3D] = useState(false);

  useEffect(() => {
    const fetchISS = async () => {
      const res = await axios.get('http://localhost:5000/api/iss-location');
      const latitude = parseFloat(res.data.iss_position.latitude);
      const longitude = parseFloat(res.data.iss_position.longitude);
      setPos({ lat: latitude, lng: longitude });
      setPath(prev => [...prev.slice(-19), [latitude, longitude]]);
    };

    fetchISS();
    const ticker = setInterval(fetchISS, 5000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <>
      <button
        onClick={() => setView3D(!view3D)}
        style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}
      >
        Switch to {view3D ? 'Map View' : 'Globe View'}
      </button>

      {view3D ? (
        <GlobeView />
      ) : (
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: 1, padding: 20, background: '#f0f2f5' }}>
            <h2>TRACK THE INTERNATIONAL SPACE STATION</h2>
            <p><strong>Latitude:</strong> {pos.lat.toFixed(4)}</p>
            <p><strong>Longitude:</strong> {pos.lng.toFixed(4)}</p>
          </div>
          <div style={{ flex: 2 }}>
            <MapContainer
              center={[pos.lat, pos.lng]}
              zoom={3}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[pos.lat, pos.lng]} icon={issIcon}>
                <Popup>🛰 ISS Current Position</Popup>
              </Marker>
              <Polyline positions={path} color="blue" weight={3} opacity={0.7} />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
