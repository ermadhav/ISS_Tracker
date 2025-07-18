import React, { useEffect, useState } from "react";
import axios from "axios";
import GlobeView from "./components/GlobeView";
import "./App.css";
import logo from "./assets/image.png"; // Make sure this file exists

const OPENCAGE_API_KEY = "5d7b2591ded44996a37ac21c77b58f13";

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
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* ✅ Updated Floating Header */}
      <header
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "max-content",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(6px)",
          borderRadius: "12px",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          zIndex: 1000,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "28px",
            width: "28px",
            borderRadius: "6px",
            objectFit: "cover",
          }}
        />
        <span
          style={{
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          🛰️ Cosmo Tracker
        </span>
      </header>

      {/* 🌐 ISS Globe */}
      <GlobeView issPosition={issPosition} path={path} />

      {/* 📩 Email Alert Form */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 20,
          width: "320px",
          background: "rgba(0, 0, 0, 0.85)",
          padding: "16px",
          borderRadius: "12px",
          color: "#fff",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "16px" }}>🔔 Get ISS Alerts</h4>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            margin: "12px 0",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleStartAlerts}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#00ffd1",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
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

      {/* ✅ Footer (unchanged, as you liked it) */}
      <footer
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "1rem",
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: "6px 12px",
          borderRadius: "8px",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.15)",
          zIndex: 1000,
          fontWeight: "500",
        }}
      >
        This website is made with ❤️ by Cosmo Coder
      </footer>
    </div>
  );
}

export default App;
