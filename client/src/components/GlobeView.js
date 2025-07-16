import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeView() {
  const globeRef = useRef();
  const [pos, setPos] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);

  useEffect(() => {
    const fetchISS = async () => {
      const res = await fetch('http://localhost:5000/api/iss-location');
      const data = await res.json();
      const lat = parseFloat(data.iss_position.latitude);
      const lng = parseFloat(data.iss_position.longitude);
      setPos({ lat, lng });
      setPath(prev => [...prev.slice(-19), { lat, lng }]);
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
      }
    };

    fetchISS();
    const ticker = setInterval(fetchISS, 5000);
    return () => clearInterval(ticker);
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
    <Globe
      ref={globeRef}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      arcsData={lastSegment}
      arcColor={() => '#ffcc00'}
      arcAltitude={0.05}
      arcStroke={2}
      arcDashLength={0.4}
      arcDashGap={2}
      arcDashInitialGap={() => Math.random() * 5}
      arcDashAnimateTime={1000}

      // Remove pointsData & pointColor to avoid default points
      pointsData={[]}

      // Use htmlElementsData to render the ISS icon image
      htmlElementsData={[pos]}
      htmlElement={(d) => {
        const el = document.createElement('img');
        el.src = '/iss-icon.png';  // Path to your icon in public folder
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.userSelect = 'none';
        el.style.pointerEvents = 'auto';
        el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.7))';
        el.title = 'ISS';
        return el;
      }}
      htmlLat={(d) => d.lat}
      htmlLng={(d) => d.lng}
    />
  );
}
