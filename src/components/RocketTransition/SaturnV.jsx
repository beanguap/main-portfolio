import { useGLTF } from '@react-three/drei';
import React, { forwardRef, useEffect, useMemo } from 'react'; // Import forwardRef
import * as THREE from 'three';

// Define FallbackRocket using memoized material
export const FallbackRocket = React.memo((props) => { // Memoize FallbackRocket
  // Wrap material creation in useMemo
  const rocketMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.8,
    roughness: 0.2,
  }), []);

  // Cleanup fallback material
  useEffect(() => {
    return () => rocketMaterial.dispose();
  }, [rocketMaterial]);

  return (
    <group {...props}>
      <mesh material={rocketMaterial}>
        <cylinderGeometry args={[0.5, 0.5, 4, 32]} />
      </mesh>
      <mesh material={rocketMaterial} position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((rotation, i) => (
        <mesh
          key={i}
          material={rocketMaterial}
          position={[0, -1.5, 0]}
          rotation={[0, rotation, 0]}
        >
          <boxGeometry args={[0.1, 1, 0.8]} />
        </mesh>
      ))}
    </group>
  );
});
FallbackRocket.displayName = 'FallbackRocket'; // Add display name

// Load the Draco-compressed model
// IMPORTANT: Replace '/models/scene-draco.glb' with the actual path to your compressed model
// You need to generate this file using tools like gltf-pipeline or Blender's Draco exporter
const MODEL_PATH = '/models/scene-draco.glb'; // ADJUST THIS PATH
// Ensure the DRACO decoder libraries are available, usually handled by drei if installed correctly
useGLTF.preload(MODEL_PATH, true, true); // 3rd arg: useCreateWorker = true

const SaturnV = forwardRef((props, ref) => { // Use forwardRef
  // Load the GLTF model with Draco enabled
  const { nodes, materials } = useGLTF(MODEL_PATH, true); // Pass true for Draco

  // Cleanup materials (optional but good practice)
  useEffect(() => {
    return () => {
      Object.values(materials).forEach(material => material.dispose());
    };
  }, [materials]);

  // Ensure the structure matches your GLTF file
  // This is a placeholder structure - replace with your actual node names
  return (
    <group ref={ref} {...props} dispose={null}> {/* Pass ref to the group */}
      {nodes.Scene && (
         <primitive object={nodes.Scene} />
      )}
    </group>
  );
});

SaturnV.displayName = 'SaturnV'; // Add display name for DevTools

export default SaturnV;
