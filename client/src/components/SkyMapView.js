// src/components/SkyMapView.js
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Inline CSS from celestial.css (simplified for core styles)
const celestialStyles = `
  #celestial-map {
    width: 100%;
    height: 100vh;
    background-color: black;
    color: white;
    font-family: sans-serif;
  }
  .celestial-container svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
`;

const SkyMapView = () => {
  const containerRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // Inject inline CSS into document
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = celestialStyles;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Load user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => setError("Location access denied.")
    );
  }, []);

  // Dynamically load and render d3-celestial
  useEffect(() => {
    if (!location || !containerRef.current) return;

    // Load celestial.js dynamically from CDN
    const script = document.createElement("script");
    script.src = "https://ofrohn.github.io/files/celestial/celestial.min.js";
    script.onload = () => {
      if (!window.Celestial) return setError("Celestial failed to load.");
      window.Celestial.display({
        width: containerRef.current.offsetWidth,
        projection: "airy",
        datapath: "https://ofrohn.github.io/files/celestial/data/",
        location: true,
        form: false,
        zoomlevel: 3,
        interactive: true,
        center: [location.lon, location.lat],
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [location]);

  if (error) return <div style={{ padding: "1rem", color: "red" }}>{error}</div>;
  if (!location) return <div style={{ padding: "1rem" }}>Getting your location...</div>;

  return (
    <div
      id="celestial-map"
      className="celestial-container"
      ref={containerRef}
    ></div>
  );
};

export default SkyMapView;
