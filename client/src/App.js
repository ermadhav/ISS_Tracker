// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import GlobeView from "./components/GlobeView";
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
  const [astronauts, setAstronauts] = useState([]); // State for astronauts

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
        velocity: issRes.data.velocity || 27574.1, // Fallback values
        altitude: issRes.data.altitude || 419.06, // Fallback values
        country,
        state,
      });

      setPath((prev) => [...prev.slice(-19), [longitude, latitude]]);

      // Fetch astronauts
      const astrosRes = await axios.get("http://localhost:5000/api/iss-astronauts");
      if (astrosRes.data && astrosRes.data.people) {
        // Filter to only include astronauts whose craft is "ISS"
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

      <GlobeView issPosition={issPosition} path={path} />

      {/* Astronaut Details Panel - Moved to bottom right, styled, with scroll */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20, // Positioned on the right
          padding: '20px 25px',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          color: '#fff',
          fontFamily: 'Segoe UI, sans-serif',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          zIndex: 1000,
          maxWidth: '320px',
          fontSize: '15px',
          lineHeight: '1.6',
          maxHeight: '400px', // Decreased height
          overflowY: 'auto' // Added scrollbar
        }}
      >
        <h3 style={{
          marginTop: 0,
          marginBottom: 10,
          fontSize: '18px',
          color: '#00ffd1',
          fontWeight: '600'
        }}>
          🧑‍🚀 Astronauts on ISS ({astronauts.length})
        </h3>
        {astronauts.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {astronauts.map((astro, index) => (
              <li key={index} style={{ marginBottom: "10px", fontSize: "14px" }}>
                <strong>👤 Name:</strong> {astro.name} <br/>
                {/* <strong>🚀 Craft:</strong> {astro.craft} <br/> */}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading astronaut data...</p>
        )}
      </div>


      <div
        style={{
          position: "absolute",
          bottom: 20,
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
            backgroundColor: "#fff",
            color: "#000"
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