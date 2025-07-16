import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon not showing in react-leaflet
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

  useEffect(() => {
    const fetchIssLocation = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/iss-location');
        const { latitude, longitude } = res.data.iss_position;
        setIssPosition({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
      } catch (error) {
        console.error('Error fetching ISS location:', error);
      }
    };

    fetchIssLocation();
    const interval = setInterval(fetchIssLocation, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>ISS Tracker</h1>
      <MapContainer center={[issPosition.latitude, issPosition.longitude]} zoom={3} style={{ height: "600px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[issPosition.latitude, issPosition.longitude]}>
          <Popup>
            ISS Current Position<br />
            Latitude: {issPosition.latitude.toFixed(2)} <br />
            Longitude: {issPosition.longitude.toFixed(2)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;
