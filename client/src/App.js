import React, { useState, useEffect } from "react";

// Main App component
const App = () => {
  // State to hold ISS data
  const [issData, setIssData] = useState({
    country: "Loading...",
    state: "Loading...",
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
  });

  // State to control tracking
  const [isTracking, setIsTracking] = useState(true);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);

  // State for user's location and email for alerts
  const [userLocation, setUserLocation] = useState({
    latitude: "",
    longitude: "",
    email: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [locationDetectMessage, setLocationDetectMessage] = useState("");

  // Function to fetch ISS data from the backend
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

      console.log("ISS Data:", data); // ✅ For debugging

      setIssData({
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        velocity: parseFloat(data.velocity),
        altitude: parseFloat(data.altitude),
        country: data.country || "N/A",
        state: data.state || "N/A",
      });
    } catch (err) {
      console.error("Failed to fetch ISS data:", err);
      setError(
        "Failed to load ISS data. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle alert setup (remains the same, interacts with backend)
  const handleAlertSetup = async (e) => {
    e.preventDefault();
    setAlertMessage(""); // Clear previous messages

    if (
      !userLocation.latitude ||
      !userLocation.longitude ||
      !userLocation.email
    ) {
      setAlertMessage("Please fill in all fields for alert setup.");
      return;
    }

    try {
      // In a real MERN app, this would call your backend API:
      // const response = await fetch('/api/users/location', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userLocation),
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const result = await response.json();
      // setAlertMessage(result.message || 'Alert setup successful!');

      // Simulate success for frontend only
      setAlertMessage("Alert setup request sent! (Backend integration needed)");
      console.log("Simulated alert setup with:", userLocation);
    } catch (err) {
      console.error("Failed to set up alert:", err);
      setAlertMessage("Failed to set up alert. Please try again.");
    }
  };

  // Function to detect user's current location using Geolocation API
  const detectUserLocation = () => {
    setLocationDetectMessage("Detecting your location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation((prev) => ({
            ...prev,
            latitude: latitude.toFixed(4), // Round to 4 decimal places
            longitude: longitude.toFixed(4), // Round to 4 decimal places
          }));
          setLocationDetectMessage("Location detected successfully!");
        },
        (geoError) => {
          console.error("Error getting location:", geoError);
          let message = "Failed to detect location.";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message =
                "Location access denied. Please allow location access in your browser settings.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = "Location information is unavailable.";
              break;
            case geoError.TIMEOUT:
              message = "The request to get user location timed out.";
              break;
            default:
              message = "An unknown error occurred while detecting location.";
              break;
          }
          setLocationDetectMessage(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationDetectMessage("Geolocation is not supported by your browser.");
    }
  };

  // Effect to start/stop tracking
  useEffect(() => {
    let intervalId;
    if (isTracking) {
      fetchIssData(); // Fetch data initially
      intervalId = setInterval(fetchIssData, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Cleanup interval
      }
    };
  }, [isTracking]); // Re-run effect when isTracking changes

  // Construct Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${issData.latitude},${issData.longitude}&z=4&output=embed`;

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col items-center p-4">
      {/* Header Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center mt-8">
        TRACK THE INTERNATIONAL SPACE STATION
      </h1>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Left Panel: ISS Data */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">Country:</span>
              <span>{issData.country}</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">State:</span>
              <span>{issData.state}</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">Latitude:</span>
              <span>{issData.latitude}</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">Longitude:</span>
              <span>{issData.longitude}</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">Velocity:</span>
              <span>{issData.velocity} kmph</span>
            </div>
            <div className="flex justify-between items-center text-lg md:text-xl">
              <span className="font-semibold">Altitude:</span>
              <span>{issData.altitude} km</span>
            </div>
          </div>

          {/* Loading and Error Messages */}
          {isLoading && (
            <div className="text-center text-blue-400 mt-6">
              Fetching ISS data...
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 mt-6">{error}</div>
          )}

          {/* Stop/Start Tracking Button */}
          <button
            onClick={() => setIsTracking((prev) => !prev)}
            className={`mt-8 w-full py-3 rounded-md font-bold text-lg transition-all duration-300
              ${
                isTracking
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
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
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
  );
};

export default App;
