// src/components/SkyMapView.js
import React from "react";

const SkyMapView = ({ userLocation }) => {
  if (!userLocation) {
    return <div style={{ color: "white", textAlign: "center", paddingTop: "50px" }}>🌌 Waiting for location...</div>;
  }

  const { latitude, longitude } = userLocation;

  const stellariumUrl = `https://stellarium-web.org/skysource.html?lat=${latitude}&lon=${longitude}&zoom=2`;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <iframe
        title="Sky Simulation"
        src={stellariumUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default SkyMapView;
