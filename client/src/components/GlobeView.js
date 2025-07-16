// src/components/GlobeView.js
import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import issIcon from '../assets/iss-icon.png';
import * as THREE from 'three'; // 👈 ADD THIS LINE

function GlobeView({ issPosition, path }) {
  const globeRef = useRef();

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: issPosition.latitude, lng: issPosition.longitude, altitude: 1.5 },
        1000
      );
    }
  }, [issPosition]);

  return (
    <div style={{ height: '100vh', backgroundColor: '#000' }}>
      <div style={{
        position: 'absolute', top: 20, left: 20, padding: 20,
        background: 'rgba(255,255,255,0.85)', borderRadius: 10, zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h3 style={{ marginTop: 0 }}>🛰 TRACK THE INTERNATIONAL SPACE STATION</h3>
        <p><strong>Country:</strong> {issPosition.country}</p>
        <p><strong>State:</strong> {issPosition.state || 'N/A'}</p>
        <p><strong>Latitude:</strong> {issPosition.latitude.toFixed(4)}</p>
        <p><strong>Longitude:</strong> {issPosition.longitude.toFixed(4)}</p>
        <p><strong>Velocity:</strong> {issPosition.velocity.toFixed(2)} km/h</p>
        <p><strong>Altitude:</strong> {issPosition.altitude.toFixed(2)} km</p>
      </div>

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="skyblue"
        atmosphereAltitude={0.25}
        pointsData={path.map(([lng, lat]) => ({ lat, lng }))}
        pointAltitude={0.01}
        pointColor={() => 'yellow'}
        customLayerData={[{
          lat: issPosition.latitude,
          lng: issPosition.longitude,
          size: 20
        }]}
        customThreeObject={() => {
          const img = new Image();
          img.src = issIcon;
          const texture = new THREE.Texture(img);
          img.onload = () => texture.needsUpdate = true;

          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(1, 1, 1);
          return sprite;
        }}
        customThreeObjectUpdate={(obj, d) => {
          Object.assign(obj.position, {
            x: globeRef.current.getGlobeRadius() * Math.cos(d.lat * Math.PI / 180) * Math.sin(d.lng * Math.PI / 180),
            y: globeRef.current.getGlobeRadius() * Math.sin(d.lat * Math.PI / 180),
            z: globeRef.current.getGlobeRadius() * Math.cos(d.lat * Math.PI / 180) * Math.cos(d.lng * Math.PI / 180)
          });
        }}
      />
    </div>
  );
}

export default GlobeView;