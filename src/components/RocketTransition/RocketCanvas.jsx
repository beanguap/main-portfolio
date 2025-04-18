import React, {
  Suspense,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import SaturnV from "./SaturnV";
import ErrorBoundary from "./ErrorBoundary";
import { FallbackRocket } from "./SaturnV";
import PixelSmokeEffect from "./PixelSmokeEffect";

// Reusable Vector3 for world position calculation
const tempWorldPos = new THREE.Vector3();

// Scene content component that uses hooks
function SceneContent({ isLaunched, onError, onTransitionComplete }) {
  const groupRef = useRef();
  const rocketModelRef = useRef(); // Ref for SaturnV model
  const { gl, scene, viewport, get } = useThree();
  const velocityRef = useRef(0); // Ref to store current velocity
  const acceleration = 0.0005; // How much to increase speed each frame
  const transitionCompletedRef = useRef(false); // Track if completion callback was called
  const stateRef = useRef({ isLaunched }); // Ref to hold latest state for listeners

  // Direct reference object that bypasses React state for better performance
  const directEmitterPosition = useRef(new THREE.Vector3(0, -1000, 0)).current;

  // State to hold the world position for smoke emission
  const [rocketWorldPos, setRocketWorldPos] = useState(
    new THREE.Vector3(0, -1000, 0)
  ); // Start off-screen
  // State for the local offset for smoke emission (computed from bounding box)
  const [smokeEmissionOffset, setSmokeEmissionOffset] = useState(
    new THREE.Vector3(0, -4.2, 0)
  );

  // Helper function to reset smoke emission offset
  const resetSmokeEmissionOffset = useCallback(() => {
    const defaultOffset = new THREE.Vector3(0, -4.2, 0);
    setSmokeEmissionOffset(defaultOffset);
  }, []);

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

      // Get the bounding box in local space
      const box = new THREE.Box3().setFromObject(rocketModelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Add a debug helper mesh at the bounding box center
      const helperMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: "blue" })
      );
      helperMesh.position.copy(center);
      scene.add(helperMesh);

      const emissionPoint = findEmissionPoint(rocketModelRef.current);

      // Set the offset with improved positioning
      setSmokeEmissionOffset(emissionPoint);

      // Immediately update world position if launched
      if (isLaunched) {
        const worldPos = new THREE.Vector3();
        worldPos.copy(emissionPoint);
        worldPos.applyMatrix4(groupRef.current.matrixWorld);

        // Update both React state and direct reference
        setRocketWorldPos(worldPos.clone());
        directEmitterPosition.copy(worldPos);
      }
    }
  }, [isLaunched, rocketModelRef.current, findEmissionPoint]);

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
        console.warn(
          "Context lost during launch, forcing transition completion."
        );
        if (!transitionCompletedRef.current) {
          onTransitionComplete?.();
          transitionCompletedRef.current = true;
        }
      }
    };

    const handleContextRestored = () => {
      // Full recovery often requires re-initializing textures, shaders, etc.
      // For simplicity here, we might just rely on user refresh or parent component handling.
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      false
    );

    return () => {
      // Check if canvas still exists before removing listeners
      if (canvas) {
        canvas.removeEventListener(
          "webglcontextlost",
          handleContextLost,
          false
        );
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored,
          false
        );
      }

      // Cleanup WebGL resources more safely
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
      // Reset smoke position state when not launched
      setRocketWorldPos(new THREE.Vector3(0, -1000, 0));
    } else {
      // When launch starts, calculate initial world pos immediately
      if (groupRef.current) {
        groupRef.current.localToWorld(
          smokeEmissionOffset.clone(),
          tempWorldPos
        );
        setRocketWorldPos(tempWorldPos);
      }
    }
    // Add smokeEmissionOffset to dependencies if it were dynamic
  }, [isLaunched, smokeEmissionOffset]);

  useFrame(({ clock }, delta) => {
    // Added delta
    if (groupRef.current) {
      if (isLaunched) {
        // Increase velocity
        velocityRef.current += acceleration;
        // Apply velocity to position
        groupRef.current.position.y += velocityRef.current;
        // Keep subtle rotation
        groupRef.current.rotation.y =
          Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

        // Always update direct emitter on every frame for perfect synchronization
        directEmitterPosition.copy(smokeEmissionOffset);
        directEmitterPosition.applyMatrix4(groupRef.current.matrixWorld);

        // Only update React state occasionally for debugging (less frequent)
        if (clock.elapsedTime % 0.5 < delta) {
          setRocketWorldPos(directEmitterPosition.clone());
        }

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
              position={[0, -4, 0]}
              scale={[0.015, 0.015, 0.015]}
            />
          }
        >
          <SaturnV
            ref={rocketModelRef} // Attach ref to SaturnV
            position={[0, -4, 0]} // Model position relative to group
            scale={[0.015, 0.015, 0.015]}
            isLaunched={isLaunched} // Pass prop if SaturnV needs it
          />
        </ErrorBoundary>
      </group>

      {/* Pixel Smoke Effect - Renders independently in world space */}
      <PixelSmokeEffect
        rocketWorldPos={rocketWorldPos}
        directEmitter={directEmitterPosition} // Pass direct reference
        isLaunched={isLaunched}
      />

      <Environment preset="sunset" />
    </>
  );
}

// Main canvas component
export default React.memo(function RocketCanvas({
  isLaunched,
  onError,
  onTransitionComplete,
}) {
  const canvasRef = useRef();
  const [hasError, setHasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const handleCanvasError = useCallback(
    (error) => {
      setHasError(true);
      onError?.(); // Notify App level
    },
    [onError]
  );

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
            const loseContextExt =
              internalGl.getExtension("WEBGL_lose_context");
            if (loseContextExt) {
              loseContextExt.loseContext();
            }
            // R3F handles disposal automatically
          } catch (error) {
            console.error("Error during canvas cleanup:", error);
          }
        }
      }
    };
  }, []);

  if (hasError || contextLost) {
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
        antialias: false, // disable default AA for better control
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        precision: "highp",
        preserveDrawingBuffer: true, // prevent flickering during transitions
      }}
      dpr={[1, 2]} // limit pixel ratio
      style={{ position: "relative" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          handleContextLoss,
          false
        );
        gl.shadowMap.enabled = false;
      }}
    >
      <Suspense fallback={null}>
        {/* Pass context loss handler down */}
        {/** Memoize SceneContent to avoid re-renders */}
        <MemoSceneContent
          isLaunched={isLaunched}
          onError={handleCanvasError}
          onTransitionComplete={onTransitionComplete}
        />
      </Suspense>
    </Canvas>
  );
});

// Memoize SceneContent for performance
const MemoSceneContent = React.memo(SceneContent);
