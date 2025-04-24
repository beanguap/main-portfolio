import { Environment } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, {
    memo,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import * as THREE from 'three';
import ErrorBoundary from './ErrorBoundary';
import PixelSmokeEffect from './PixelSmokeEffect';
import SaturnV, { FallbackRocket } from './SaturnV';

// Scene content component that uses hooks
function SceneContent({ isLaunched, onError, onTransitionComplete }) {
  const groupRef = useRef();
  const rocketModelRef = useRef(); // Ref for SaturnV model
  const { scene, viewport } = useThree();
  const velocityRef = useRef(0); // Ref to store current velocity
  const acceleration = 0.0005; // How much to increase speed each frame
  const transitionCompletedRef = useRef(false); // Track if completion callback was called

  // Define a stable ref for the direct emitter position
  const directEmitterPosition = useRef(new THREE.Vector3(0, -1000, 0)); // Start off-screen

  // State for the local offset for smoke emission (computed from bounding box)
  const [smokeEmissionOffset, setSmokeEmissionOffset] = useState(
    new THREE.Vector3(0, -4.2, 0)
  );

  // Helper function to find the correct emission point
  const findEmissionPoint = useCallback((rocketObject) => {
    if (!rocketObject) return new THREE.Vector3(0, -4.2, 0);

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(rocketObject);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Return a position at the bottom-center of the bounding box with slight offset
    return new THREE.Vector3(center.x, box.min.y - 0.5, center.z);
  }, []);

  // Compute bounding box after SaturnV is loaded and attached
  useEffect(() => {
    if (groupRef.current && rocketModelRef.current) {
      // Get the world matrix of the rocket model
      rocketModelRef.current.updateWorldMatrix(true, true);

      const emissionPoint = findEmissionPoint(rocketModelRef.current);

      // Set the offset with improved positioning
      setSmokeEmissionOffset(emissionPoint);

      // Immediately update directEmitterPosition ref if launched
      if (isLaunched) {
        const worldPos = directEmitterPosition.current; // Use the ref directly
        worldPos.copy(emissionPoint);
        worldPos.applyMatrix4(groupRef.current.matrixWorld);
      }
    }
  }, [isLaunched, findEmissionPoint]);

  // Cleanup WebGL resources on unmount
  useEffect(() => {
    return () => {
      // Check if scene and traverse exist before calling
      scene?.traverse?.((object) => {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material?.dispose());
          } else {
            // Dispose textures attached to the material
            for (const key in object.material) {
              const value = object.material[key];
              if (value && typeof value === 'object' && value.isTexture) {
                value.dispose();
              }
            }
            object.material?.dispose();
          }
        }
      });
    };
  }, [scene]);

  // Effect to reset position and velocity when launch state changes
  useEffect(() => {
    if (!isLaunched) {
      velocityRef.current = 0;
      transitionCompletedRef.current = false; // Reset completion tracker
      if (groupRef.current) {
        groupRef.current.position.y = -3; // Reset to initial position
        groupRef.current.rotation.y = 0; // Reset rotation
      }
      // Reset directEmitterPosition ref when not launched
      directEmitterPosition.current.set(0, -1000, 0);
    } else {
      // When launch starts, calculate initial world pos immediately and update ref
      if (groupRef.current) {
        directEmitterPosition.current.copy(smokeEmissionOffset);
        directEmitterPosition.current.applyMatrix4(groupRef.current.matrixWorld);
      }
    }
  }, [isLaunched, smokeEmissionOffset]);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      if (isLaunched) {
        // Increase velocity
        velocityRef.current += acceleration;
        // Apply velocity to position
        groupRef.current.position.y += velocityRef.current;
        // Keep subtle rotation
        groupRef.current.rotation.y =
          Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

        // Always update direct emitter ref on every frame for perfect synchronization
        directEmitterPosition.current.copy(smokeEmissionOffset);
        directEmitterPosition.current.applyMatrix4(groupRef.current.matrixWorld);

        // Check if rocket is off-screen
        const exitThreshold = viewport.height / 1.5;
        if (
          groupRef.current.position.y > exitThreshold &&
          !transitionCompletedRef.current
        ) {
          onTransitionComplete?.();
          transitionCompletedRef.current = true;
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
        <ErrorBoundary
          fallback={
            <FallbackRocket
              ref={rocketModelRef} // Pass ref to fallback
              position={[0, -4, 0]}
              scale={[0.015, 0.015, 0.015]}
            />
          }
        >
          <SaturnV
            ref={rocketModelRef} // Attach ref to SaturnV
            position={[0, -4, 0]} // Model position relative to group
            scale={[0.015, 0.015, 0.015]}
          />
        </ErrorBoundary>
      </group>

      {/* Pixel Smoke Effect - Renders independently in world space */}
      <PixelSmokeEffect
        directEmitter={directEmitterPosition.current} // Pass direct reference
        isLaunched={isLaunched}
      />

      <Environment preset="sunset" />
    </>
  );
}

// Main canvas component
const RocketCanvas = memo(function RocketCanvas({
  isLaunched,
  onError,
  onTransitionComplete,
}) {
  const [hasError, setHasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const handleCanvasError = useCallback(
    (error) => {
      console.error("Canvas error caught:", error);
      setHasError(true);
      onError?.(error);
    },
    [onError]
  );

  const handleContextLost = useCallback((event) => {
    event.preventDefault();
    console.warn("WebGL context lost in RocketCanvas.");
    setContextLost(true);
    onError?.(new Error("WebGL context lost"));
  }, [onError]);

  const handleContextRestored = useCallback((scene) => {
    console.log("WebGL context restored in RocketCanvas.");
    setContextLost(false);
    scene.traverse((obj) => {
      if (obj.material) {
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mats.forEach((mat) => {
          if (mat) {
            mat.needsUpdate = true;
            Object.values(mat).forEach((value) => {
              if (value && value.isTexture) {
                value.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }, []);

  if (hasError || contextLost) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#111',
          color: '#fff',
        }}
      >
        WebGL context lost or error occurred.
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{
        alpha: true,
        antialias: false, // Disable default AA for improved stability
        preserveDrawingBuffer: true, // Helps prevent flickering and assists in context restoration
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        precision: 'highp',
      }}
      dpr={[1, 2]}
      onCreated={(state) => {
        const { gl, scene } = state;
        const domElement = gl.domElement;

        domElement.addEventListener('webglcontextlost', handleContextLost, false);
        domElement.addEventListener(
          'webglcontextrestored',
          () => handleContextRestored(scene), // Pass scene to handler
          false
        );

        gl.shadowMap.enabled = false;
      }}
      style={{ position: 'relative' }}
    >
      <Suspense fallback={null}>
        <MemoSceneContent
          isLaunched={isLaunched}
          onError={handleCanvasError}
          onTransitionComplete={onTransitionComplete}
        />
      </Suspense>
    </Canvas>
  );
});
RocketCanvas.displayName = 'RocketCanvas'; // Add display name

// Memoize SceneContent for performance
const MemoSceneContent = memo(SceneContent);
MemoSceneContent.displayName = 'MemoSceneContent'; // Add display name

export default RocketCanvas; // Export the memoized component
