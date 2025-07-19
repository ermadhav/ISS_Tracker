// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import GlobeView from "./components/GlobeView";
import SkyMapView from "./components/SkyMapView";
import LiveFeed from "./components/LiveFeed";
import "./App.css";
import logo from "./assets/logo2.png";

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
  const [astronauts, setAstronauts] = useState([]);
  const [view, setView] = useState("globe");

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
      const issRes = await axios.get("http://localhost:5000/api/iss-location");
      const latitude = parseFloat(issRes.data.iss_position.latitude);
      const longitude = parseFloat(issRes.data.iss_position.longitude);

      const geoRes = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
      );

      const components = geoRes.data.results[0]?.components || {};
      const country = components.country || "International Waters";
      const state = components.state || components.region || "";

      setIssPosition({
        latitude,
        longitude,
        velocity: issRes.data.velocity || 27574.1,
        altitude: issRes.data.altitude || 419.06,
        country,
        state,
      });

      setPath((prev) => [...prev.slice(-19), [longitude, latitude]]);

      const astrosRes = await axios.get(
        "http://localhost:5000/api/iss-astronauts"
      );
      if (astrosRes.data && astrosRes.data.people) {
        const issAstronauts = astrosRes.data.people.filter(
          (astro) => astro.craft === "ISS"
        );
        setAstronauts(issAstronauts);
      }

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
      <header
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "150px",
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(255, 255, 255, 0.08)",
          zIndex: 1000,
        }}
      >
        <img
          src={logo}
          alt="Cosmo Logo"
          style={{
            height: "150px",
            width: "150px",
            objectFit: "cover",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </header>

      <div
        style={{
          position: "absolute",
          top: 20,
          left: '50%',
          zIndex: 1001,
          display: "flex",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.1)",
          padding: "8px 12px",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <button
          onClick={() => setView("globe")}
          style={{
            background: view === "globe" ? "#00ffd1" : "transparent",
            color: "#000",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🌐 Globe
        </button>
        <button
          onClick={() => setView("sky")}
          style={{
            background: view === "sky" ? "#00ffd1" : "transparent",
            color: "#000",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          🌌 Sky Map
        </button>
        <button
          onClick={() => setView("feed")}
          style={{
            background: view === "feed" ? "#00ffd1" : "transparent",
            color: "#000",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📺 Live Feed
        </button>
      </div>

      {view === "globe" && <GlobeView issPosition={issPosition} path={path} />}
      {view === "sky" && <SkyMapView userLocation={userLocation} />}
      {view === "feed" && <LiveFeed />}

      {/* Remaining UI unchanged */}

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
