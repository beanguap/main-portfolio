import { Environment } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, {
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

// Hoist reusable THREE objects
const tempVec3 = new THREE.Vector3();
const tempBox3 = new THREE.Box3();

// Helper function to dispose textures within a material
const disposeMaterialTextures = (material) => {
  if (!material) return;
  Object.keys(material).forEach((key) => {
    const value = material[key];
    if (value && typeof value === 'object' && value.isTexture) {
      value.dispose();
    }
  });
};

// Scene content component that uses hooks
function SceneContent({ isLaunched, onError, onTransitionComplete }) {
  const groupRef = useRef();
  const rocketModelRef = useRef();
  const { scene, viewport } = useThree();
  const velocityRef = useRef(0);
  const acceleration = 0.0005;
  const transitionCompletedRef = useRef(false);

  const directEmitterPosition = useRef(new THREE.Vector3()); // Keep stable ref

  const [rocketWorldPos, setRocketWorldPos] = useState(
    () => new THREE.Vector3(0, -1000, 0) // Initialize with function
  );
  const [smokeEmissionOffset, setSmokeEmissionOffset] = useState(
    () => new THREE.Vector3(0, -1.5, 0) // Default offset, adjust as needed
  );

  // Function to find emission point (assuming it exists or is defined elsewhere)
  const findEmissionPoint = useCallback((model) => {
    if (!model) return new THREE.Vector3(0, -1.5, 0); // Default if model not loaded
    tempBox3.setFromObject(model);
    const size = tempBox3.getSize(tempVec3);
    return new THREE.Vector3(0, tempBox3.min.y - size.y * 0.1, 0); // Point slightly below the bottom
  }, []);

  // Effect to find emission point once model is loaded
  useEffect(() => {
    if (rocketModelRef.current) {
      const emissionPoint = findEmissionPoint(rocketModelRef.current);
      setSmokeEmissionOffset(emissionPoint);
    }
  }, [findEmissionPoint]); // Re-run if findEmissionPoint changes (though it's stable here)

  // Cleanup WebGL resources on unmount - Enhanced
  useEffect(() => {
    const currentScene = scene; // Capture scene in effect scope
    return () => {
      currentScene?.traverse?.((object) => {
        object.geometry?.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => {
              disposeMaterialTextures(material); // Dispose textures
              material?.dispose();
            });
          } else {
            disposeMaterialTextures(object.material); // Dispose textures
            object.material?.dispose();
          }
        }
      });
    };
  }, [scene]); // Dependency on scene

  // Effect to reset position and velocity when launch state changes
  useEffect(() => {
    if (!isLaunched) {
      velocityRef.current = 0;
      transitionCompletedRef.current = false;
      if (groupRef.current) {
        groupRef.current.position.y = -3;
        groupRef.current.rotation.y = 0;
      }
      setRocketWorldPos(tempVec3.set(0, -1000, 0)); // Use tempVec3
    } else {
      // When launch starts, calculate initial world pos immediately
      if (groupRef.current && smokeEmissionOffset) {
        // Use tempVec3 for calculation
        groupRef.current.localToWorld(smokeEmissionOffset.clone(), tempVec3);
        setRocketWorldPos(tempVec3.clone()); // Clone result into state
        directEmitterPosition.current.copy(tempVec3); // Update direct ref
      }
    }
  }, [isLaunched, smokeEmissionOffset]); // smokeEmissionOffset added

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      if (isLaunched) {
        velocityRef.current += acceleration;
        groupRef.current.position.y += velocityRef.current;
        groupRef.current.rotation.y =
          Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

        // Update direct emitter position using tempVec3
        directEmitterPosition.current
          .copy(smokeEmissionOffset)
          .applyMatrix4(groupRef.current.matrixWorld);

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

      <group ref={groupRef}>
        <ErrorBoundary
          fallback={
            <FallbackRocket
              position={[0, -4, 0]}
              scale={[0.015, 0.015, 0.015]}
            />
          }
        >
          <Suspense
            fallback={
              <FallbackRocket
                position={[0, -4, 0]}
                scale={[0.015, 0.015, 0.015]}
              />
            }
          >
            <SaturnV
              ref={rocketModelRef}
              position={[0, -4, 0]}
              scale={[0.015, 0.015, 0.015]}
            />
          </Suspense>
        </ErrorBoundary>
      </group>

      {/* Pass the stable ref directly */}
      <PixelSmokeEffect
        directEmitter={directEmitterPosition.current}
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
  const [hasError, setHasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const glRef = useRef(null); // Ref to store gl context for cleanup

  const handleCanvasError = useCallback(
    (error) => {
      console.error('Canvas error caught:', error);
      setHasError(true);
      onError?.(error);
    },
    [onError]
  );

  const handleContextLost = useCallback(
    (event) => {
      event.preventDefault();
      console.warn('WebGL context lost!');
      setContextLost(true);
      onError?.(new Error('WebGL context lost'));
    },
    [onError]
  );

  const handleContextRestored = useCallback(() => {
    console.log('WebGL context restored.');
    setContextLost(false);
  }, []);

  // Cleanup listeners on unmount
  useEffect(() => {
    const currentGl = glRef.current;
    const domElement = currentGl?.domElement;

    if (domElement) {
      domElement.addEventListener(
        'webglcontextlost',
        handleContextLost,
        false
      );
      domElement.addEventListener(
        'webglcontextrestored',
        handleContextRestored,
        false
      );
    }

    return () => {
      if (domElement) {
        domElement.removeEventListener(
          'webglcontextlost',
          handleContextLost,
          false
        );
        domElement.removeEventListener(
          'webglcontextrestored',
          handleContextRestored,
          false
        );
      }
    };
  }, [handleContextLost, handleContextRestored]); // Re-attach if handlers change

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
        antialias: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        precision: 'highp',
      }}
      // Cap DPR
      dpr={Math.min(window.devicePixelRatio || 1, 2)}
      onCreated={(state) => {
        glRef.current = state.gl; // Store gl context
        state.gl.shadowMap.enabled = false;
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

// Memoize SceneContent for performance
const MemoSceneContent = React.memo(SceneContent);
