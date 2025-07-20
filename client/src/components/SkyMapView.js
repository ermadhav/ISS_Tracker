import React, { useEffect, useRef, useState } from "react";

function SkyMapView({ userLocation }) {
  const skyRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.virtualsky) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://virtualsky.lco.global/virtualsky.min.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject("Failed to load virtualsky.js");

        document.body.appendChild(script);
      });
    };

    const renderSkyMap = () => {
      if (!userLocation) {
        setError("Waiting for location...");
        return;
      }

      if (!skyRef.current) {
        setError("Sky container not found.");
        return;
      }

      skyRef.current.innerHTML = ""; // clear old sky if re-rendering

      window.virtualsky({
        id: "sky",
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
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

    loadScript()
      .then(renderSkyMap)
      .catch((err) => setError(err));
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
