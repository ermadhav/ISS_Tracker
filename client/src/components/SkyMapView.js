// SkyMapView.js
import React, { useEffect, useState } from "react";

function SkyMapView({ userLocation }) {
  const [error, setError] = useState(null);

  if (!userLocation) {
    return <div style={{ color: "#fff" }}>📍 Waiting for user location...</div>;
  }

  try {
    // Simulate safe rendering of map here
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        🌌 Sky Map for your location:
        <br />
        Lat: {userLocation.latitude}, Lng: {userLocation.longitude}
      </div>
    );
  } catch (err) {
    console.error("SkyMapView crashed:", err);
    return <div style={{ color: "red" }}>⚠️ Sky Map failed: {err.message}</div>;
  }
}

export default SkyMapView;
