import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Scene content that uses hooks - must be inside Canvas
function SceneContent() {
  useFrame(({ clock }) => {
    // Animation logic here
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault
        position={[0, 0, isMobile() ? 25 : 30]}
        fov={isMobile() ? 85 : 75}
        near={0.1}
        far={1000}
      />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </>
  );
}

// Main scene component
export function HeroScene3D() {
  const [isMounted, setIsMounted] = useState(false);
  const isMobileDevice = isMobile();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup
    };
  }, []);

  // Don't render until mounted to avoid SSR issues
  if (!isMounted) return null;

  return (
    <Canvas 
      dpr={isMobileDevice ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio}
      gl={{ 
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true 
      }}
    >
      <SceneContent />
    </Canvas>
  );
}