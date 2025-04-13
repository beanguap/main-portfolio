import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import SaturnV from './SaturnV';
import ErrorBoundary from './ErrorBoundary';
import { FallbackRocket } from './SaturnV';

// Scene content component that uses hooks
function SceneContent({ isLaunched, onError }) {
  const groupRef = useRef();
  const { gl, scene } = useThree();
  const velocityRef = useRef(0); // Ref to store current velocity
  const acceleration = 0.0005; // How much to increase speed each frame

  // Handle context events
  useEffect(() => {
    const handleContextLost = (event) => {
      event.preventDefault();
      console.log("WebGL context lost, attempting to restore...");
      onError?.();
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      // Cleanup WebGL resources
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [gl, scene, onError]);

  // Effect to reset position and velocity when launch state changes
  useEffect(() => {
    if (!isLaunched) {
      velocityRef.current = 0;
      if (groupRef.current) {
        groupRef.current.position.y = -3; // Reset to initial position
        groupRef.current.rotation.y = 0; // Reset rotation
      }
    }
  }, [isLaunched]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (isLaunched) {
        // Increase velocity
        velocityRef.current += acceleration;
        // Apply velocity to position
        groupRef.current.position.y += velocityRef.current;
        // Keep subtle rotation
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      } 
      // No need for explicit else to reset here due to the useEffect above
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[0, -3, 2]} intensity={1.2} color="orange" />
      <group ref={groupRef}>
        <ErrorBoundary fallback={<FallbackRocket position={[0, -4, 0]} scale={[0.03, 0.03, 0.03]}/>}>
          <SaturnV 
            position={[0, -4, 0]}
            scale={[0.03, 0.03, 0.03]}
            isLaunched={isLaunched}
          />
        </ErrorBoundary>
      </group>
      <Environment preset="sunset" />
    </>
  );
}

// Main canvas component
export default function RocketCanvas({ isLaunched, onError }) {
  const canvasRef = useRef();
  const [hasError, setHasError] = useState(false);

  const handleCanvasError = useCallback((error) => {
    console.error('Canvas error:', error);
    setHasError(true);
    onError?.();
  }, [onError]);

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        const gl = canvasRef.current.__r3f?.gl;
        if (gl) {
          try {
            gl.dispose();
            const extension = gl.getExtension('WEBGL_lose_context');
            if (extension) extension.loseContext();
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }
      }
    };
  }, []);

  if (hasError) {
    return null;
  }

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ position: 'relative' }}
      onError={handleCanvasError}
    >
      <Suspense fallback={null}>
        <SceneContent isLaunched={isLaunched} onError={handleCanvasError} />
      </Suspense>
    </Canvas>
  );
}