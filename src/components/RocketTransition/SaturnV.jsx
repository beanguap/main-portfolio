import { useGLTF } from '@react-three/drei';
import { forwardRef, useEffect, useMemo } from 'react'; // Added forwardRef
import * as THREE from 'three';

// Preload GLTF outside the component (at module scope)
useGLTF.preload('/scene.gltf');

// Define FallbackRocket using memoized material
export const FallbackRocket = forwardRef((props, ref) => { // Use forwardRef
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
    <group {...props} ref={ref}> {/* Attach ref here */}
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

const SaturnV = forwardRef(({ _isLaunched, ...props }, ref) => { // Use forwardRef and accept ref
  const { scene, materials, nodes } = useGLTF('/scene.gltf');

  // Cleanup function for GLTF materials, geometries and cache
  useEffect(() => {
    return () => {
      try {
        if (materials) {
          Object.values(materials).forEach((mat) => {
            if (mat) {
              Object.values(mat).forEach(prop => {
                if (prop && prop.isTexture) {
                  prop.dispose();
                }
              });
              mat.dispose();
            }
          });
        }
        if (nodes) {
          Object.values(nodes).forEach((node) => {
            if (node && node.geometry) {
              node.geometry.dispose();
            }
          });
        }
        useGLTF.clear('/scene.gltf');
      } catch (_err) {
        console.error('Error disposing GLTF resources in SaturnV:', _err);
      }
    };
  }, [materials, nodes]);

  // Memoize the cloned scene
  const clonedScene = useMemo(() => scene?.clone(true), [scene]);

  // Check if scene loaded
  if (!clonedScene) {
    console.warn('GLTF scene not loaded or cloned, using fallback');
    return <FallbackRocket {...props} ref={ref} />;
  }

  return <primitive ref={ref} object={clonedScene} {...props} />;
});
SaturnV.displayName = 'SaturnV'; // Add display name

export default SaturnV;
