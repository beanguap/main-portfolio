import projectsData from '@assets/projectsData'; // Import projects data
import ErrorBoundary from '@components/RocketTransition/ErrorBoundary';
import { Environment, Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Bloom,
    EffectComposer,
    Noise,
    Vignette,
} from '@react-three/postprocessing';
import { device } from '@utils/device';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Hoist reusable THREE objects
const tempColor = new THREE.Color();
const tempVec3 = new THREE.Vector3();

// Enhanced particle field with better performance on mobile
function ParticleField() {
  const particles = useRef();
  const geometryRef = useRef();
  const materialRef = useRef();
  const { isMobile: isMobileDevice, isIPhone12Pro: isIPhone12 } = device;

  // Increase particle count for better coverage
  const particlesCount = isIPhone12 ? 800 : isMobileDevice ? 1200 : 2500;

  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      if (i < particlesCount * 0.8) {
        const theta = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (isMobileDevice ? 35 : 60);
        pos[i * 3] = Math.cos(theta) * radius;
        pos[i * 3 + 1] = (Math.random() - 0.5) * (isMobileDevice ? 30 : 50);
        pos[i * 3 + 2] = Math.sin(theta) * radius;
      } else {
        pos[i * 3] = (Math.random() - 0.5) * (isMobileDevice ? 60 : 100);
        pos[i * 3 + 1] = (Math.random() - 0.5) * (isMobileDevice ? 40 : 70);
        pos[i * 3 + 2] = (Math.random() - 0.5) * (isMobileDevice ? 60 : 100);
      }
    }
    return pos;
  }, [isMobileDevice, particlesCount]);

  const colors = useMemo(() => {
    const col = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      tempColor.setHSL(
        0.6 + Math.random() * 0.05,
        0.8,
        0.5 + Math.random() * 0.3
      );
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
    }
    return col;
  }, [particlesCount]);

  useEffect(() => {
    const currentGeometry = geometryRef.current;
    const currentMaterial = materialRef.current;
    return () => {
      currentMaterial?.dispose();
      currentGeometry?.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    if (!particles.current) return;
    particles.current.rotation.y += delta * (isMobileDevice ? 0.05 : 0.08);

    const positions = particles.current.geometry.attributes.position.array;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < particlesCount; i++) {
      const idx = i * 3;
      const x = positions[idx];
      const z = positions[idx + 2];
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const rotationSpeed = 0.15 * (1 - distanceFromCenter / 70) * delta;
      const cosR = Math.cos(rotationSpeed);
      const sinR = Math.sin(rotationSpeed);
      positions[idx] = x * cosR - z * sinR;
      positions[idx + 2] = z * cosR + x * sinR;
      positions[idx + 1] += Math.sin(t + i * 0.1) * delta * 0.2;
    }

    particles.current.geometry.attributes.position.needsUpdate = true;
    particles.current.position.y = Math.sin(t * 0.2) * 0.5;
  });

  return (
    <points ref={particles}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={isMobileDevice ? 0.12 : 0.18}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Enhanced project card component in 3D
function ProjectCard({ position, rotation, index }) {
  const mesh = useRef();
  const geometryRef = useRef();
  const materialRef = useRef();
  const { isMobile: isMobileDevice } = device;
  const scale = 1;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.position.y = Math.sin(t * 0.5 + index) * 0.1;
    mesh.current.rotation.z = Math.sin(t * 0.3 + index * 0.2) * 0.05;
  });

  useEffect(() => {
    const currentGeometry = geometryRef.current;
    const currentMaterial = materialRef.current;
    return () => {
      currentMaterial?.dispose();
      currentGeometry?.dispose();
    };
  }, []);

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.15}
      floatIntensity={isMobileDevice ? 0.2 : 0.4}
      position={position}
      scale={scale}
    >
      <mesh ref={mesh} rotation={rotation}>
        <planeGeometry
          ref={geometryRef}
          args={[isMobileDevice ? 1.5 : 2, isMobileDevice ? 2.25 : 3]}
        />
        <meshStandardMaterial
          ref={materialRef}
          color="#000000"
          metalness={0.7}
          roughness={0.3}
          opacity={0.9}
          transparent
          side={THREE.DoubleSide}
          emissive="#1a1a1a"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Animated background glow
function BackgroundGlow() {
  const geometryRef = useRef();
  const materialRef = useRef();
  const { isMobile: isMobileDevice } = device;

  useEffect(() => {
    const currentGeometry = geometryRef.current;
    const currentMaterial = materialRef.current;
    return () => {
      currentMaterial?.dispose();
      currentGeometry?.dispose();
    };
  }, []);

  return (
    <mesh position={[0, 0, -10]}>
      <sphereGeometry ref={geometryRef} args={[7, 32, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#102054"
        transparent
        opacity={isMobileDevice ? 0.15 : 0.2}
      />
    </mesh>
  );
}

// Main scene component with optimized rendering
export function Scene3D({ projects = projectsData }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isMobile: isMobileDevice, isIPhone12Pro: isIPhone12 } = device;

  useEffect(() => {
    setIsMounted(true);
    return () => {};
  }, []);

  if (!isMounted) return null;

  return (
    <ErrorBoundary fallback={<></>}>
      <Canvas
        camera={{
          position: [0, 0, isIPhone12 ? 30 : isMobileDevice ? 35 : 45],
          fov: isMobileDevice ? 90 : 100,
          near: 0.1,
          far: 1000,
        }}
        dpr={Math.min(window.devicePixelRatio || 1, 2)}
        performance={{ min: 0.5 }}
        gl={{
          antialias: !isMobileDevice,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <color attach="background" args={['#000000']} />

        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={0.7}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <BackgroundGlow />
        <ParticleField />

        {projects.map((project, index) => {
          const theta = (index / projects.length) * Math.PI * 2;
          const radius = isMobileDevice ? 4 : 5;
          return (
            <ProjectCard
              key={project.id}
              index={index}
              position={[Math.cos(theta) * radius, 0, Math.sin(theta) * radius]}
              rotation={[0, -theta, 0]}
            />
          );
        })}

        <Environment preset="night" />

        <EffectComposer enabled={!isMobileDevice} multisampling={0}>
          <Bloom luminanceThreshold={0.5} intensity={1} radius={0.4} />
          <Noise opacity={0.02} />
          <Vignette darkness={0.5} offset={0.5} eskil={false} />
        </EffectComposer>
      </Canvas>
    </ErrorBoundary>
  );
}
