import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Particle field component for the nebula effect
function ParticleField() {
  const particles = useRef();
  
  const particlesCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    particles.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#538CFF"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Project card component in 3D
function ProjectCard({ position, rotation, project }) {
  const mesh = useRef();

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      position={position}
    >
      <mesh ref={mesh} rotation={rotation}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial
          color="#000000"
          metalness={0.7}
          roughness={0.3}
          opacity={0.9}
          transparent
        />
      </mesh>
    </Float>
  );
}

// Main scene component
export function Scene3D({ projects }) {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <color attach="background" args={['#000000']} />
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <ParticleField />

      {projects.map((project, index) => {
        const theta = (index / projects.length) * Math.PI * 2;
        const radius = 5;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            position={[
              Math.cos(theta) * radius,
              0,
              Math.sin(theta) * radius
            ]}
            rotation={[0, -theta, 0]}
          />
        );
      })}

      <Environment preset="night" />
      
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} intensity={1.5} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  );
}