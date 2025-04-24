import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Define FallbackRocket using memoized material
export const FallbackRocket = (props) => {
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
};

export default function SaturnV({ _isLaunched, ...props }) { // Prefixed unused prop
  // Preload GLTF within component (inside Canvas context)
  useEffect(() => {
    useGLTF.preload('/scene.gltf');
  }, []);

  const rocketRef = useRef();
  const { scene, materials, nodes } = useGLTF('/scene.gltf');

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
        useGLTF.clear('/scene.gltf');
      } catch (_err) { // Prefix unused 'err' with underscore
        console.error('Error disposing GLTF resources in SaturnV:', _err);
      }
    };
  }, [materials, nodes]);

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
