import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

function BackgroundParticles() {
  const points = useRef();
  const isMobileDevice = isMobile();
  
  const particleCount = isMobileDevice ? 1500 : 3000;
  
  // Create particles
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for(let i = 0; i < particleCount; i++) {
    // Position
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    // Color - using a blue gradient
    const h = 0.6 + Math.random() * 0.05;
    const s = 0.8;
    const l = 0.5 + Math.random() * 0.3;
    const color = new THREE.Color().setHSL(h, s, l);
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  useFrame((state, delta) => {
    if (!points.current) return;
    
    points.current.rotation.y += delta * 0.05;
    points.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobileDevice ? 0.1 : 0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobileDevice = isMobile();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <Canvas
      camera={{
        position: [0, 0, isMobileDevice ? 30 : 25],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      dpr={Math.min(window.devicePixelRatio, 2)}
    >
      <color attach="background" args={['#000000']} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      <BackgroundParticles />
      
      <Environment preset="night" />
    </Canvas>
  );
}