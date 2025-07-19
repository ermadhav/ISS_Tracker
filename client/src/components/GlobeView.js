// src/components/GlobeView.js
import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import issIcon from '../assets/icon3.png';
import * as THREE from 'three';

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
    <div style={{ height: '100vh', backgroundColor: '#000', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: '20px 25px',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        color: '#fff',
        fontFamily: 'Segoe UI, sans-serif',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        zIndex: 1000,
        maxWidth: '320px',
        fontSize: '15px',
        lineHeight: '1.6'
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: 10,
          fontSize: '18px',
          color: '#00ffd1',
          fontWeight: '600'
        }}>
          🛰️ Details International Space Station
        </h3>
        <p><strong>🌍 Country:</strong> {issPosition.country}</p>
        <p><strong>📍 State:</strong> {issPosition.state || 'N/A'}</p>
        <p><strong>🧭 Latitude:</strong> {issPosition.latitude.toFixed(4)}</p>
        <p><strong>🧭 Longitude:</strong> {issPosition.longitude.toFixed(4)}</p>
        <p><strong>🚀 Velocity:</strong> {issPosition.velocity.toFixed(2)} km/h</p>
        <p><strong>🛰️ Altitude:</strong> {issPosition.altitude.toFixed(2)} km</p>
      </div>

      {/* <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '1rem',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: '6px 12px',
        borderRadius: '8px',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.15)',
        zIndex: 1000,
        fontWeight: '500'
      }}>
        🛰️ ISS Live Location
      </div> */}
  
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="skyblue"
        atmosphereAltitude={0.25}
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
          sprite.scale.set(7, 7, 7);
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