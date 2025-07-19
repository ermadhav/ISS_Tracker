import React, { useEffect } from "react";

const SkyMapView = ({ userLocation }) => {
  useEffect(() => {
    if (window.S && userLocation) {
      window.S.virtualsky({
        id: "sky-map",
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        projection: "stereo",
        showplanets: true,
        gridlines_az: true,
        ground: true,
        live: true,
        cardinalpoints: true,
      });
    }
  }, [userLocation]);

  return (
    <div
      id="sky-map"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
      }}
    />
  );
};

export default SkyMapView;
