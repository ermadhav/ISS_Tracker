// src/components/SkyMapView.js
import React, { useEffect, useRef, useState } from "react";

function SkyMapView({ userLocation }) {
  const skyRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userLocation) {
      setError("Waiting for location...");
      return;
    }

    const loadSkyMap = (lat, lng) => {
      if (!window.virtualsky) {
        setError("virtualsky script not loaded.");
        return;
      }

      window.virtualsky({
        id: "sky",
        latitude: lat,
        longitude: lng,
        projection: "stereo",
        constellations: true,
        constellationlabels: true,
        gridlines_az: true,
        planets: true,
        showposition: true,
        mouse: true,
        ground: true,
        cardinalpoints: true,
        fov: 90,
      });
    };

    loadSkyMap(userLocation.latitude, userLocation.longitude);
  }, [userLocation]);

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: "#000" }}>
      {error && (
        <p
          style={{
            color: "white",
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(255,0,0,0.7)",
            padding: "10px 20px",
            borderRadius: "10px",
            zIndex: 1000,
          }}
        >
          {error}
        </p>
      )}
      <div
        id="sky"
        ref={skyRef}
        style={{ height: "100%", width: "100%", backgroundColor: "black" }}
      />
    </div>
  );
}

export default SkyMapView;
