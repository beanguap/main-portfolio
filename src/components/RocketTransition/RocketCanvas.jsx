import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import SaturnV from './SaturnV';
import ErrorBoundary from './ErrorBoundary';
import { FallbackRocket } from './SaturnV';
import PixelSmokeEffect from './PixelSmokeEffect';

// Scene content component that uses hooks
function SceneContent({ isLaunched, onError, onTransitionComplete }) {
  const groupRef = useRef();
  const { gl, scene, viewport, get } = useThree();
  const velocityRef = useRef(0); // Ref to store current velocity
  const acceleration = 0.0005; // How much to increase speed each frame
  const transitionCompletedRef = useRef(false); // Track if completion callback was called
  const stateRef = useRef({ isLaunched }); // Ref to hold latest state for listeners

  // Update state ref whenever isLaunched changes
  useEffect(() => {
    stateRef.current.isLaunched = isLaunched;
  }, [isLaunched]);

  // Handle context events
  useEffect(() => {
    const context = get().gl; // Get current context
    if (!context?.domElement) return; // Exit if no context/canvas yet
    
    const canvas = context.domElement;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn("WebGL context lost. Attempting to notify parent...");
      onError?.(); // Notify parent component of error
      // If context is lost *during* launch, trigger completion to avoid getting stuck
      if (stateRef.current.isLaunched) {
          console.warn("Context lost during launch, forcing transition completion.");
          if (!transitionCompletedRef.current) {
            onTransitionComplete?.();
            transitionCompletedRef.current = true;
          }
      }
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored. Application might need refresh for full recovery.");
      // Full recovery often requires re-initializing textures, shaders, etc.
      // For simplicity here, we might just rely on user refresh or parent component handling.
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      // Check if canvas still exists before removing listeners
      if (canvas) {
          canvas.removeEventListener('webglcontextlost', handleContextLost, false);
          canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
      }

      // Cleanup WebGL resources more safely
      // Check if scene and traverse exist before calling
      scene?.traverse?.((object) => {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material?.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    };
    // Add get to dependencies to re-run if context changes (though unlikely)
  }, [gl, scene, onError, onTransitionComplete, get]);

  // Effect to reset position and velocity when launch state changes
  useEffect(() => {
    if (!isLaunched) {
      velocityRef.current = 0;
      transitionCompletedRef.current = false; // Reset completion tracker
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
        
        // Check if rocket is off-screen (adjust threshold as needed)
        // Using viewport.height as a rough guide
        const exitThreshold = viewport.height / 1.5; // Adjust this factor
        if (groupRef.current.position.y > exitThreshold && !transitionCompletedRef.current) {
            console.log("Rocket exit threshold reached, triggering transition complete.");
            onTransitionComplete?.();
            transitionCompletedRef.current = true; // Ensure callback is called only once
        }
      } 
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[0, -3, 2]} intensity={1.2} color="orange" />
      
      {/* Rocket Group - This moves */}
      <group ref={groupRef}>
        <ErrorBoundary fallback={<FallbackRocket position={[0, -4, 0]} scale={[0.015, 0.015, 0.015]}/>}>
          <SaturnV 
            position={[0, -4, 0]}
            scale={[0.015, 0.015, 0.015]}
            isLaunched={isLaunched}
          />
          <PixelSmokeEffect 
            isLaunched={isLaunched}
            count={150}
            explosionSpeed={1.5}
            position={[0, -4.2, 0]}
          />
        </ErrorBoundary>
      </group>
      
      <Environment preset="sunset" />
    </>
  );
}

// Main canvas component
export default function RocketCanvas({ isLaunched, onError, onTransitionComplete }) {
  const canvasRef = useRef();
  const [hasError, setHasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const handleCanvasError = useCallback((error) => {
    console.error('Canvas error detected:', error);
    setHasError(true);
    onError?.(); // Notify App level
  }, [onError]);

  const handleContextLoss = useCallback(() => {
      console.warn("RocketCanvas notified of context loss.");
      setContextLost(true); // Set state to indicate context loss
      // We already notify parent via onError in SceneContent
  }, []);

  useEffect(() => {
    // This cleanup tries to lose context gracefully if component unmounts
    // Note: Might not always work if unmount is abrupt
    return () => {
      if (canvasRef.current) {
        const internalGl = canvasRef.current.__r3f?.gl;
        if (internalGl) {
          try {
            const loseContextExt = internalGl.getExtension('WEBGL_lose_context');
            if (loseContextExt) {
              loseContextExt.loseContext();
              console.log('Attempted to gracefully lose context on unmount.')
            }
            // R3F usually handles disposal, but explicit dispose might be needed in complex cases
            // internalGl.dispose?.(); 
          } catch (error) {
            console.error('Error during canvas cleanup:', error);
          }
        }
      }
    };
  }, []);

  if (hasError || contextLost) {
    console.log("Rendering null for RocketCanvas due to error or context loss.");
    // Optionally render a fallback message instead of null
    // return <div style={{ /* style for error message */ }}>WebGL unavailable or context lost.</div>;
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
        // Explicitly request stencil and depth buffers if needed by effects/materials
        // stencil: false, // Default
        // depth: true, // Default
      }}
      style={{ position: 'relative' }}
      onCreated={({ gl }) => {
          // Add context loss/restore listeners directly on creation if possible
          // This might be redundant with the one in SceneContent but ensures early setup
          gl.domElement.addEventListener('webglcontextlost', handleContextLoss, false);
          // Add restore listener if needed
          // gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
      }}
      // R3F default error boundaries might handle some errors, 
      // but explicit onError can catch others.
      // Pass our specific error handler.
    >
      <Suspense fallback={null}>
          {/* Pass context loss handler down */}
          <SceneContent 
            isLaunched={isLaunched} 
            onError={handleCanvasError} 
            onTransitionComplete={onTransitionComplete}
          />
      </Suspense>
    </Canvas>
  );
}