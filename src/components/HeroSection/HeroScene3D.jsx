import ErrorBoundary from '@components/RocketTransition/ErrorBoundary';
import { Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { device } from '@utils/device';
import React, { useEffect, useState } from 'react'; // Import React

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

// Memoize SceneContent
const MemoizedSceneContent = React.memo(SceneContent);

// Main scene component
function HeroScene3DComponent() { // Rename original component
  const [isMounted, setIsMounted] = useState(false);
  const { isMobile: isMobileDevice } = device;

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
          position: [0, 0, isMobileDevice ? 25 : 30],
          fov: isMobileDevice ? 85 : 75,
          near: 0.1,
          far: 1000,
        }}
        // Cap DPR
        dpr={Math.min(window.devicePixelRatio || 1, 2)}
        gl={{
          antialias: !isMobileDevice, // Disable AA on mobile
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <MemoizedSceneContent /> {/* Use memoized version */}
      </Canvas>
    </ErrorBoundary>
  );
}

// Export memoized version
export const HeroScene3D = React.memo(HeroScene3DComponent);
