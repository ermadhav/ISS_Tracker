import React, { useEffect, useState } from "react";

const SkyMapView = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude.toFixed(6),
          lon: position.coords.longitude.toFixed(6),
        });
      },
      (err) => {
        setError("Failed to retrieve your location.");
      }
    );
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!coords) {
    return <div>Fetching your location...</div>;
  }

  const { lat, lon } = coords;
  const srcUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}`;

  return (
    <iframe
      title="Sky Map"
      src={srcUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
      style={{ border: "none" }}
    />
  );
};

export default SkyMapView;
