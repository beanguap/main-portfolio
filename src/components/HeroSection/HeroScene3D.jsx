import { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import ErrorBoundary from '@components/RocketTransition/ErrorBoundary';
import { isMobile } from '@utils/device';

// Scene content that uses hooks - must be inside Canvas
function SceneContent() {
  useFrame(({ clock: _clock }) => {
    // Animation logic here
  });

  return (
    <>
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
    <ErrorBoundary fallback={<></>}>
      <Canvas
        camera={{
          position: [0, 0, isMobile() ? 25 : 30],
          fov: isMobile() ? 85 : 75,
          near: 0.1,
          far: 1000,
        }}
        dpr={
          isMobileDevice
            ? Math.min(window.devicePixelRatio, 1.5)
            : window.devicePixelRatio
        }
        gl={{
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <SceneContent />
      </Canvas>
    </ErrorBoundary>
  );
}
