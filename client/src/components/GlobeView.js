import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function ISSDashboard() {
  const globeRef = useRef();
  const [issData, setIssData] = useState({
    latitude: 0,
    longitude: 0,
    velocity: 0,
    altitude: 0,
  });
  const [path, setPath] = useState([]);

  useEffect(() => {
    const fetchISS = async () => {
      const res = await fetch('http://localhost:5000/api/iss-location');
      const data = await res.json();
      const lat = parseFloat(data.iss_position.latitude);
      const lng = parseFloat(data.iss_position.longitude);

      setIssData({
        latitude: lat,
        longitude: lng,
        velocity: data.velocity || 27574.10,
        altitude: data.altitude || 419.06,
      });

      setPath(prev => [...prev.slice(-19), { lat, lng }]);

      if (globeRef.current) {
        globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  const lastSegment = path.length >= 2
    ? [{
        startLat: path[path.length - 2].lat,
        startLng: path[path.length - 2].lng,
        endLat: path[path.length - 1].lat,
        endLng: path[path.length - 1].lng,
        color: ['#ffcc00'],
      }]
    : [];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body, html, #root {
          margin: 0; padding: 0; height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #121212;
          color: #eee;
        }
        .container {
          display: flex;
          height: 100vh;
          width: 100vw;
        }
        .info-panel {
          background: #1f1f1f;
          width: 350px;
          padding: 30px 25px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
          border-radius: 15px 0 0 15px;
        }
        h1 {
          font-weight: 700;
          margin-bottom: 15px;
          color: #ffc107;
          text-align: center;
          letter-spacing: 1.2px;
        }
        .label {
          font-weight: 600;
          font-size: 14px;
          color: #bbb;
          margin-top: 18px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .value {
          font-weight: 700;
          font-size: 22px;
          margin-top: 5px;
          color: #fff;
        }
        .button-stop {
          margin-top: 40px;
          padding: 12px;
          background: #ff3b3b;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          user-select: none;
        }
        .button-stop:hover {
          background: #e03131;
        }
        .globe-wrapper {
          flex-grow: 1;
          position: relative;
        }
        .globe-wrapper canvas {
          border-radius: 0 15px 15px 0;
          box-shadow: inset 0 0 40px #ffc107aa;
        }
        /* ISS Icon glow */
        .iss-icon {
          filter: drop-shadow(0 0 6px #ffc107);
        }
      `}</style>

      <div className="container">
        <div className="info-panel">
          <h1>TRACK THE INTERNATIONAL SPACE STATION</h1>
          <div>
            <div className="label">Country:</div>
            <div className="value">Indonesia</div>

            <div className="label">State:</div>
            <div className="value">South Papua</div>

            <div className="label">Latitude:</div>
            <div className="value">{issData.latitude.toFixed(4)}</div>

            <div className="label">Longitude:</div>
            <div className="value">{issData.longitude.toFixed(4)}</div>

            <div className="label">Velocity:</div>
            <div className="value">{issData.velocity.toFixed(2)} kmph</div>

            <div className="label">Altitude:</div>
            <div className="value">{issData.altitude.toFixed(2)} km</div>

            <button className="button-stop" onClick={() => alert('Tracking stopped!')}>
              STOP TRACKING
            </button>
          </div>
        </div>

        <div className="globe-wrapper">
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            arcsData={lastSegment}
            arcColor={() => '#ffc107'}
            arcAltitude={0.05}
            arcStroke={2}
            arcDashLength={0.4}
            arcDashGap={2}
            arcDashInitialGap={() => Math.random() * 5}
            arcDashAnimateTime={1000}

            // Remove default points
            pointsData={[]}

            // Render ISS icon as HTML element on globe
            htmlElementsData={[issData]}
            htmlElement={(d) => {
              const el = document.createElement('img');
              el.src = '/iss-icon.png'; // Make sure iss-icon.png is in public folder
              el.style.width = '50px';
              el.style.height = '50px';
              el.className = 'iss-icon';
              el.title = 'International Space Station';
              return el;
            }}
            htmlLat={d => d.latitude}
            htmlLng={d => d.longitude}
          />
        </div>
      </div>
    </>
  );
}
