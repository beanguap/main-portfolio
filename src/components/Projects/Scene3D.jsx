import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Float, Environment, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// iPhone 12 Pro specific detection
const isIPhone12Pro = () => {
  const iOS = /iPhone/.test(navigator.userAgent);
  if (!iOS) return false;
  
  // Check for approximate screen dimensions of iPhone 12 Pro
  return window.screen.width === 390 || window.screen.height === 390;
};

// Enhanced particle field with better performance on mobile
function ParticleField() {
  const particles = useRef();
  const isMobileDevice = isMobile();
  const isIPhone12 = isIPhone12Pro();
  
  // Reduce particle count for mobile devices
  const particlesCount = isIPhone12 ? 350 : isMobileDevice ? 500 : 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * (isMobileDevice ? 5 : 10);
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * (isMobileDevice ? 5 : 10);
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, [isMobileDevice, isIPhone12, particlesCount]);
  
  // Add colors for more visual interest
  const colors = useMemo(() => {
    const col = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const h = i / particlesCount;
      
      // Use a blue color palette
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.05, 0.8, 0.5 + Math.random() * 0.3);
      
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return col;
  }, [particlesCount]);

  useFrame((state, delta) => {
    // Slower rotation on mobile for better performance
    particles.current.rotation.y += delta * (isMobileDevice ? 0.02 : 0.04);
    
    // Add subtle movement to particles
    const t = state.clock.getElapsedTime() * 0.2;
    particles.current.position.y = Math.sin(t) * 0.2;
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
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobileDevice ? 0.03 : 0.05}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Enhanced project card component in 3D
function ProjectCard({ position, rotation, project, index, totalProjects }) {
  const mesh = useRef();
  const isMobileDevice = isMobile();
  const { viewport } = useThree();
  
  // Adjust size based on viewport width
  const scale = isMobileDevice ? 0.85 : 1;
  
  // Use progress to animate in cards sequentially
  const progress = index / totalProjects;
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Add subtle floating animation
    mesh.current.position.y = Math.sin(t * 0.5 + index) * 0.1;
    
    // Add subtle rotation for more dynamic feel
    mesh.current.rotation.z = Math.sin(t * 0.3 + index * 0.2) * 0.05;
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.15}
      floatIntensity={isMobileDevice ? 0.2 : 0.4}
      position={position}
      scale={scale}
    >
      <mesh 
        ref={mesh} 
        rotation={rotation}
      >
        <planeGeometry args={[isMobileDevice ? 1.5 : 2, isMobileDevice ? 2.25 : 3]} />
        <meshStandardMaterial
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
  const isMobileDevice = isMobile();
  
  useFrame(({ clock }) => {
    // Pulsating animation
    const t = clock.getElapsedTime();
  });
  
  return (
    <mesh position={[0, 0, -10]}>
      <sphereGeometry args={[7, 32, 32]} />
      <meshBasicMaterial 
        color="#102054" 
        transparent 
        opacity={isMobileDevice ? 0.15 : 0.2} 
      />
    </mesh>
  );
}

// Main scene component with optimized rendering
export function Scene3D({ projects }) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobileDevice = isMobile();
  const isIPhone12 = isIPhone12Pro();

  useEffect(() => {
    setIsMounted(true);
    
    // Clean up any heavy resources when component unmounts
    return () => {
      // Dispose of any resources if needed
    };
  }, []);

  // Don't render until mounted to avoid SSR issues
  if (!isMounted) return null;

  return (
    <Canvas 
      camera={{ 
        position: [0, 0, isIPhone12 ? 13 : isMobileDevice ? 12 : 10], 
        fov: isMobileDevice ? 60 : 70,
        near: 0.1,
        far: 1000
      }}
      dpr={isMobileDevice ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio}
      performance={{ min: 0.5 }}
      gl={{ 
        antialias: !isMobileDevice,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true 
      }}
    >
      <color attach="background" args={['#000000']} />
      
      {/* Optimized lighting */}
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.7} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Background glow effect */}
      <BackgroundGlow />
      
      {/* Particle field */}
      <ParticleField />

      {/* Project cards */}
      {projects.map((project, index) => {
        const theta = (index / projects.length) * Math.PI * 2;
        const radius = isMobileDevice ? 4 : 5;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            totalProjects={projects.length}
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
      
      {/* Optimize post-processing for mobile */}
      <EffectComposer enabled={!isMobileDevice} multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={1} radius={0.4} />
        <Noise opacity={0.02} />
        <Vignette darkness={0.5} offset={0.5} eskil={false} />
      </EffectComposer>
      
      {/* Simplified post-processing for mobile */}
      {isMobileDevice && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.6} intensity={0.8} radius={0.3} />
        </EffectComposer>
      )}
    </Canvas>
  );
}