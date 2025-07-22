// src/components/SkyMapView.js
import React, { useEffect, useState } from "react";

const SkyMapView = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  // Get user's current geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude.toFixed(6),
          lon: position.coords.longitude.toFixed(6),
        });
      },
      () => {
        setError("Unable to retrieve your location. Please allow location access.");
      }
    );
  }, []);

  // Error display
  if (error) {
    return <div style={{ color: "red", padding: "1rem" }}>{error}</div>;
  }

  // Loading state while fetching location
  if (!coords) {
    return <div style={{ padding: "1rem" }}>Fetching your location...</div>;
  }

  // Construct Stellarium URL with lat/lon
  const { lat, lon } = coords;
  const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}`;

  // Render the iframe
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        title="Sky Map"
        src={stellariumUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        style={{ border: "none" }}
      />
    </div>
  );
};

export default SkyMapView;