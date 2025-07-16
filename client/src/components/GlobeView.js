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
      globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
    };

    fetchISS();
    const ticker = setInterval(fetchISS, 5000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <Globe
      ref={globeRef}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={[pos]}
      pointLat="lat"
      pointLng="lng"
      pointColor={() => '#ff6600'}
      pointAltitude={0.02}
      pointLabel={() => '🛰 ISS'}
      arcsData={path.length > 1 ? [{
        startLat: path[path.length - 2].lat,
        startLng: path[path.length - 2].lng,
        endLat: path[path.length - 1].lat,
        endLng: path[path.length - 1].lng,
        color: ['#ffcc00'],
      }] : []}
      arcColor="color"
      arcAltitude={0.05}
      arcStroke={2}
      arcDashLength={0.4}
      arcDashGap={2}
      arcDashInitialGap={() => Math.random() * 5}
      arcDashAnimateTime={1000}
    />
  );
}
