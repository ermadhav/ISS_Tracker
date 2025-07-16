import React, { useState, useEffect } from "react";

// Main App component
const App = () => {
  const [issData, setIssData] = useState({
    country: "Loading...",
    state: "Loading...",
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
  });

  const [isTracking, setIsTracking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userLocation, setUserLocation] = useState({
    latitude: "",
    longitude: "",
    email: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [locationDetectMessage, setLocationDetectMessage] = useState("");

  const fetchIssData = async () => {
    if (!isTracking) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/iss-position");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setIssData({
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        velocity: parseFloat(data.velocity),
        altitude: parseFloat(data.altitude),
        country: data.country || "N/A",
        state: data.state || "N/A",
      });
    } catch (err) {
      setError(
        "Failed to load ISS data. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertSetup = async (e) => {
    e.preventDefault();
    setAlertMessage("");

    if (
      !userLocation.latitude ||
      !userLocation.longitude ||
      !userLocation.email
    ) {
      setAlertMessage("Please fill in all fields for alert setup.");
      return;
    }

    try {
      setAlertMessage("Alert setup request sent! (Backend integration needed)");
      console.log("Simulated alert setup with:", userLocation);
    } catch (err) {
      console.error("Failed to set up alert:", err);
      setAlertMessage("Failed to set up alert. Please try again.");
    }
  };

  const detectUserLocation = () => {
    setLocationDetectMessage("Detecting your location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation((prev) => ({
            ...prev,
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4),
          }));
          setLocationDetectMessage("Location detected successfully!");
        },
        (geoError) => {
          let message = "Failed to detect location.";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message =
                "Location access denied. Please allow location access.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = "Location information is unavailable.";
              break;
            case geoError.TIMEOUT:
              message = "Request to get user location timed out.";
              break;
            default:
              message = "An unknown error occurred.";
              break;
          }
          setLocationDetectMessage(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationDetectMessage("Geolocation is not supported.");
    }
  };

  useEffect(() => {
    let intervalId;
    if (isTracking) {
      fetchIssData();
      intervalId = setInterval(fetchIssData, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isTracking]);

  const mapUrl = `https://maps.google.com/maps?q=${issData.latitude},${issData.longitude}&z=4&output=embed`;

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col items-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center mt-8">
        TRACK THE INTERNATIONAL SPACE STATION
      </h1>

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">Country:</span>
              <span>{issData.country}</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">State:</span>
              <span>{issData.state}</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">Latitude:</span>
              <span>{issData.latitude}</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">Longitude:</span>
              <span>{issData.longitude}</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">Velocity:</span>
              <span>{issData.velocity} kmph</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl">
              <span className="font-semibold">Altitude:</span>
              <span>{issData.altitude} km</span>
            </div>
          </div>

          {isLoading && (
            <div className="text-blue-400 mt-6 text-center">
              Fetching ISS data...
            </div>
          )}
          {error && (
            <div className="text-red-500 mt-6 text-center">{error}</div>
          )}

          <button
            onClick={() => setIsTracking((prev) => !prev)}
            className={`mt-8 w-full py-3 rounded-md font-bold text-lg transition-all duration-300 ${
              isTracking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isTracking ? "STOP TRACKING" : "START TRACKING"}
          </button>
        </div>

        {/* Right Panel: Map */}
        <div className="w-full md:w-1/2 h-96 md:h-auto bg-gray-800 flex items-center justify-center">
          <iframe
            title="ISS Location Map"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: "0 0 0.5rem 0.5rem" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default App;
