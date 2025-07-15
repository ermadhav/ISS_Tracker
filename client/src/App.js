import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
  // State to hold ISS data
  const [issData, setIssData] = useState({
    country: 'Loading...',
    state: 'Loading...',
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
    latitude: '',
    longitude: '',
    email: '',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [locationDetectMessage, setLocationDetectMessage] = useState('');

  // Function to fetch ISS data from the backend
  const fetchIssData = async () => {
    if (!isTracking) return; // Only fetch if tracking is active

    setIsLoading(true);
    setError(null);
    try {
      // In a real MERN app, this would call your backend API:
      // const response = await fetch('/api/iss/current');
      // For this environment, we simulate it or use a public API directly (with CORS considerations)
      const response = await fetch('https://api.open-notify.org/iss-now.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const { latitude, longitude } = data.iss_position;

      // Simulate country/state or use a reverse geocoding API on backend
      const simulatedCountry = "Earth";
      const simulatedState = "Orbit";
      const simulatedVelocity = (27000 + Math.random() * 1000).toFixed(2); // ~27,600 km/h
      const simulatedAltitude = (400 + Math.random() * 50).toFixed(2); // ~420 km

      setIssData({
        country: simulatedCountry,
        state: simulatedState,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        velocity: parseFloat(simulatedVelocity),
        altitude: parseFloat(simulatedAltitude),
      });
    } catch (err) {
      console.error("Failed to fetch ISS data:", err);
      setError("Failed to load ISS data. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle alert setup (remains the same, interacts with backend)
  const handleAlertSetup = async (e) => {
    e.preventDefault();
    setAlertMessage(''); // Clear previous messages

    if (!userLocation.latitude || !userLocation.longitude || !userLocation.email) {
      setAlertMessage('Please fill in all fields for alert setup.');
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
      setAlertMessage('Alert setup request sent! (Backend integration needed)');
      console.log('Simulated alert setup with:', userLocation);
    } catch (err) {
      console.error("Failed to set up alert:", err);
      setAlertMessage("Failed to set up alert. Please try again.");
    }
  };

  // Function to detect user's current location using Geolocation API
  const detectUserLocation = () => {
    setLocationDetectMessage('Detecting your location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(prev => ({
            ...prev,
            latitude: latitude.toFixed(4), // Round to 4 decimal places
            longitude: longitude.toFixed(4), // Round to 4 decimal places
          }));
          setLocationDetectMessage('Location detected successfully!');
        },
        (geoError) => {
          console.error("Error getting location:", geoError);
          let message = 'Failed to detect location.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message = 'Location access denied. Please allow location access in your browser settings.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case geoError.TIMEOUT:
              message = 'The request to get user location timed out.';
              break;
            default:
              message = 'An unknown error occurred while detecting location.';
              break;
          }
          setLocationDetectMessage(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationDetectMessage('Geolocation is not supported by your browser.');
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
            <div className="text-center text-red-500 mt-6">
              {error}
            </div>
          )}

          {/* Stop/Start Tracking Button */}
          <button
            onClick={() => setIsTracking(prev => !prev)}
            className={`mt-8 w-full py-3 rounded-md font-bold text-lg transition-all duration-300
              ${isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
          >
            {isTracking ? 'STOP TRACKING' : 'START TRACKING'}
          </button>
        </div>

        {/* Right Panel: Map */}
        <div className="w-full md:w-1/2 h-96 md:h-auto bg-gray-800 flex items-center justify-center">
          <iframe
            title="ISS Location Map"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>

      {/* Alert System Section */}
      <div className="w-full max-w-6xl bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Setup Sighting Alerts</h2>
        <p className="text-gray-400 text-center mb-6">
          Enter your location and email to receive alerts when the ISS is visible from your area.
        </p>
        <form onSubmit={handleAlertSetup} className="space-y-4">
          {/* Detect Location Button */}
          <button
            type="button"
            onClick={detectUserLocation}
            className="w-full py-2 rounded-md font-bold text-md bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300 mb-4"
          >
            Detect My Location
          </button>
          {locationDetectMessage && (
            <p className="text-center text-sm font-medium text-blue-300 mb-4">
              {locationDetectMessage}
            </p>
          )}

          <div>
            <label htmlFor="lat" className="block text-gray-300 text-sm font-bold mb-2">
              Your Latitude:
            </label>
            <input
              type="number"
              id="lat"
              step="0.0001"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
              placeholder="e.g., 34.0522"
              value={userLocation.latitude}
              onChange={(e) => setUserLocation({ ...userLocation, latitude: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="lon" className="block text-gray-300 text-sm font-bold mb-2">
              Your Longitude:
            </label>
            <input
              type="number"
              id="lon"
              step="0.0001"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
              placeholder="e.g., -118.2437"
              value={userLocation.longitude}
              onChange={(e) => setUserLocation({ ...userLocation, longitude: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
              Your Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
              placeholder="you@example.com"
              value={userLocation.email}
              onChange={(e) => setUserLocation({ ...userLocation, email: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-md font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300"
          >
            Enable Alerts
          </button>
        </form>
        {alertMessage && (
          <p className="mt-4 text-center text-sm font-medium text-yellow-400">
            {alertMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
