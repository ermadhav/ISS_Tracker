// SkyMapView.js
import React from "react";
import { Helmet } from "react-helmet";

function SkyMapView({ userLocation }) {
  if (!userLocation) {
    return <div style={{ color: "#fff" }}>📍 Waiting for user location...</div>;
  }

  const { latitude, longitude } = userLocation;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Helmet>
        <script src="https://virtualsky.lco.global/virtualsky.min.js"></script>
      </Helmet>
      <div id="skymap" style={{ height: "100vh", width: "100vw" }}></div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener("load", function() {
              new VirtualSky({
                id: "skymap",
                latitude: ${latitude},
                longitude: ${longitude},
                projection: "stereo",
                constellations: true,
                showposition: true,
                showdate: true,
                gridlines_az: true
              });
            });
          `,
        }}
      />
    </div>
  );
}

export default SkyMapView;
