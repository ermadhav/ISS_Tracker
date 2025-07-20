// src/components/SkyMapView.jsx
import React, { useEffect, useRef } from "react";

function SkyMapView({ userLocation }) {
  const skyRef = useRef(null);

  useEffect(() => {
    if (!window.VirtualSky) {
      console.error("VirtualSky not loaded");
      return;
    }
    if (!skyRef.current) return;

    const { latitude = 22.7633, longitude = 75.8797 } = userLocation || {};

    // Initialize VirtualSky with your location or default
    const sky = new window.VirtualSky(skyRef.current, {
      projection: "stereo",
      showstarlabels: true,
      showplanetlabels: true,
      showdate: false,
      showposition: false,
      latitude,
      longitude,
    });

    // Optional: sky.goToRaDec(ra, dec) if needed

    return () => {
      // No cleanup method provided by VirtualSky
    };
  }, [userLocation]);

  return (
    <div>
      <h2>🌌 Sky Map for your location:</h2>
      <div
        ref={skyRef}
        style={{ width: "600px", height: "600px", backgroundColor: "black" }}
      />
    </div>
  );
}

export default SkyMapView;
