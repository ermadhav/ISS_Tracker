import React, { useEffect, useRef } from "react";

function SkyMapView() {
  const skyRef = useRef(null);

  useEffect(() => {
    if (!window.VirtualSky) {
      console.error("VirtualSky is not loaded");
      return;
    }

    const sky = new window.VirtualSky(skyRef.current, {
      projection: "stereo",
      showstarlabels: true,
      showplanetlabels: true,
      showdate: false,
      showposition: false,
      latitude: 22.763276959059286,  // example latitude
      longitude: 75.8796544034434,   // example longitude
      // other options as needed
    });

    sky.goToRaDec(0, 0);

    return () => {
      // Cleanup if VirtualSky exposes anything — usually no explicit destroy
    };
  }, []);

  return (
    <div>
      <h2>🌌 Sky Map for your location:</h2>
      <div
        ref={skyRef}
        style={{ width: "600px", height: "600px", backgroundColor: "black" }}
      ></div>
    </div>
  );
}

export default SkyMapView;
