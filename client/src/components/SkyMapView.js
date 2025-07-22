// src/components/SkyMapView.js
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
// import "./celestial.css"; // Update path if placed elsewhere

const SkyMapView = () => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Get geolocation
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(coords);
      },
      () => setError("Location permission denied.")
    );
  }, []);

  useEffect(() => {
    if (!location || !containerRef.current) return;

    // Load Celestial script dynamically
    const script = document.createElement("script");
    script.src = "/celestial/celestial.js"; // update if path differs
    script.onload = () => {
      window.Celestial.display({
        width: containerRef.current.offsetWidth,
        projection: "airy",
        datapath: "/celestial/data/", // Path to stars.json, constellations.json, etc.
        location: true,
        form: false,
        zoomlevel: 3,
        interactive: true,
        center: [location.lon, location.lat],
      });
    };
    document.body.appendChild(script);
  }, [location]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!location) return <div>Loading sky map based on your location...</div>;

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh", backgroundColor: "#000" }}
    />
  );
};

export default SkyMapView;
