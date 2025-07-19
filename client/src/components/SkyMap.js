// SkyMap.js
import React, { useEffect, useRef } from "react";
// import "./SkyMap.css";

const SkyMap = () => {
  const containerRef = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://slowe.github.io/VirtualSky/js/virtualsky.min.js";
    script.onload = () => {
      const planetarium = window.virtualsky({
        id: "skymap",
        projection: "stereo",
        mouse: true,
        showstars: true,
        showconstellations: true,
        showplanets: true,
        latitude: 28.6139, // Default location
        longitude: 77.209,
        scalestars: 2,
        gradient: true
      });

      // Optional: Update to user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          planetarium.setLocation(pos.coords.latitude, pos.coords.longitude);
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10000,
        width: "90vw",
        height: "90vh",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.95)",
        boxShadow: "0 0 40px rgba(0,255,209,0.4)",
      }}
    >
      <div id="skymap" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default SkyMap;
