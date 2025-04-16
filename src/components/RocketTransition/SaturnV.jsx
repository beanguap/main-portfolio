import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Preload the model
useGLTF.preload('/scene.gltf');

// Define FallbackRocket at the top level and export it
export const FallbackRocket = (props) => {
  // Create a basic material for the fallback
  const rocketMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.8,
    roughness: 0.2
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
      {[0, Math.PI/2, Math.PI, Math.PI*3/2].map((rotation, i) => (
        <mesh key={i} material={rocketMaterial} position={[0, -1.5, 0]} rotation={[0, rotation, 0]}>
          <boxGeometry args={[0.1, 1, 0.8]} />
        </mesh>
      ))}
    </group>
  );
};

export default function SaturnV({ isLaunched, ...props }) {
  const rocketRef = useRef();
  const { scene, materials, nodes } = useGLTF('/scene.gltf');

  // Create a basic material (this is for the actual model, keep separate)
  const modelMaterial = new THREE.MeshStandardMaterial({
    color: '#e0e0e0', // Slightly different color to distinguish if needed
    metalness: 0.7,
    roughness: 0.3
  });

  // Cleanup function for GLTF materials and geometries
  useEffect(() => {
    return () => {
      // Dispose of GLTF materials
      if (materials) {
        Object.values(materials).forEach(material => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      }
      // Dispose of GLTF geometries
      if (nodes) {
        Object.values(nodes).forEach(node => {
          if (node.geometry) node.geometry.dispose();
        });
      }
      // Dispose of the specific model material if used
      modelMaterial.dispose();
      // Clear the loaded GLTF from cache
      useGLTF.clear('/scene.gltf');
    };
  }, [materials, nodes, modelMaterial]); // Use modelMaterial here

  // Clone the scene
  const clonedScene = scene ? scene.clone(true) : null;
  
  // Traverse the cloned scene
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        // Optionally apply the modelMaterial if needed, otherwise GLTF materials are used
      });
    }
  }, [clonedScene]);

  // Check if scene loaded
  if (!scene) {
    console.warn('GLTF scene not loaded, using fallback');
    // Pass props to FallbackRocket
    return <FallbackRocket {...props} />;
  }

  return (
    <primitive 
      ref={rocketRef}
      object={clonedScene}
      {...props}
    />
  );
}