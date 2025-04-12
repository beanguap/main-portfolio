import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

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
      camera={{ 
        position: [0, 0, isMobileDevice ? 25 : 30],
        fov: isMobileDevice ? 85 : 75,
        near: 0.1,
        far: 1000
      }}
      dpr={isMobileDevice ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio}
      gl={{ 
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true 
      }}
    >
      {/* Removing the black background color */}
    </Canvas>
  );
}