// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import GlobeView from "./components/GlobeView";

const OPENCAGE_API_KEY = "5d7b2591ded44996a37ac21c77b58f13"; // Replace with your real key

function App() {
  const [issPosition, setIssPosition] = useState({
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
    country: "Loading...",
    state: "",
  });

  const [path, setPath] = useState([]);
  const [email, setEmail] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  const fetchISS = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/iss-location");
      const latitude = parseFloat(res.data.iss_position.latitude);
      const longitude = parseFloat(res.data.iss_position.longitude);

      const geoRes = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
      );

      const components = geoRes.data.results[0]?.components || {};
      const country = components.country || "International Waters";
      const state = components.state || components.region || "";

      setIssPosition({
        latitude,
        longitude,
        velocity: res.data.velocity || 27574.1,
        altitude: res.data.altitude || 419.06,
        country,
        state,
      });

      setPath((prev) => [...prev.slice(-19), [longitude, latitude]]);

      // ✅ Alert only if enabled
      if (alertsEnabled && userLocation && email) {
        const result = await axios.post(
          "http://localhost:5000/api/check-visibility",
          {
            userLat: userLocation.latitude,
            userLng: userLocation.longitude,
            email,
          }
        );
        setMessage(result.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch ISS or geolocation data:", error);
    }
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 10000);
    return () => clearInterval(interval);
  }, [userLocation, email, alertsEnabled]);

  const handleStartAlerts = () => {
    if (!email || !userLocation) {
      setMessage("Please enter your email and allow location.");
      return;
    }
    setAlertsEnabled(true);
    setMessage("🚀 Alerts activated!");
  };

  return (
    <div>
      <GlobeView issPosition={issPosition} path={path} />
      {/* Alert Control Box */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          width: "340px",
          background: "rgba(255,255,255,0.1)",
          padding: "16px",
          borderRadius: "12px",
          color: "#fff",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          border: "1px solid rgba(255,255,255,0.2)",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <h4 style={{ margin: 0 }}>🔔 Get ISS Alerts</h4>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            margin: "10px 0",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleStartAlerts}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "#00ffd1",
            color: "#000",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ✅ Start Alerts
        </button>
        {message && (
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: message.includes("not") ? "orange" : "lightgreen",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
