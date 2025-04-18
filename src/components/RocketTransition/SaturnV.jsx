import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Define FallbackRocket at the top level and export it
export const FallbackRocket = (props) => {
  // Create a basic material for the fallback
  const rocketMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.8,
    roughness: 0.2,
  });

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
};

export default function SaturnV({ isLaunched, ...props }) {
  // Preload GLTF within component (inside Canvas context)
  useEffect(() => {
    useGLTF.preload('/scene.gltf');
  }, []);

  const rocketRef = useRef();
  const { scene, materials, nodes } = useGLTF('/scene.gltf');

  // Create a basic material (this is for the actual model, keep separate)
  const modelMaterial = new THREE.MeshStandardMaterial({
    color: '#e0e0e0', // Slightly different color to distinguish if needed
    metalness: 0.7,
    roughness: 0.3,
  });

  // Cleanup function for GLTF materials, geometries and cache
  useEffect(() => {
    return () => {
      try {
        if (materials) {
          Object.values(materials).forEach((mat) => {
            mat.map?.dispose();
            mat.dispose();
          });
        }
        if (nodes) {
          Object.values(nodes).forEach((node) => node.geometry?.dispose());
        }
        modelMaterial?.dispose();
        useGLTF.clear('/scene.gltf');
      } catch (err) {
        console.error('Error disposing GLTF resources in SaturnV:', err);
      }
    };
  }, [materials, nodes, modelMaterial]);

  // Clone the scene for rendering
  const clonedScene = scene ? scene.clone(true) : null;

  // Check if scene loaded
  if (!scene) {
    console.warn('GLTF scene not loaded, using fallback');
    // Pass props to FallbackRocket
    return <FallbackRocket {...props} />;
  }

  return <primitive ref={rocketRef} object={clonedScene} {...props} />;
}
