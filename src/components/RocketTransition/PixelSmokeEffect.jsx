import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Detect mobile devices and adjust particle count
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Custom shader material for simpler pixel/glow particles
const pixelVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pixelFragmentShader = `
  varying vec2 vUv;
  uniform vec3 color;
  uniform float opacity;

  void main() {
    // Calculate the difference from the center (0.5, 0.5)
    vec2 d = abs(vUv - 0.5);
    // Use the maximum distance to create a square shape
    float m = max(d.x, d.y);
    // Smooth transition within the square; adjust 0.35 and 0.45 as needed
    float intensity = 1.0 - smoothstep(0.35, 0.45, m);
    
    gl_FragColor = vec4(color, opacity * intensity);
  }
`;

export default function PixelSmokeEffect({ 
  isLaunched = false, 
  count = isMobile ? 80 : 150,
  explosionSpeed = 1.5, // Increase default explosionSpeed significantly
  position = [0, 0, 0] // Local position offset within parent group
}) {
  // No need for hasBurst state anymore
  const localBasePosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const frameCount = useRef(0); // For logging purposes

  // Create custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        opacity: { value: 1.0 },
      },
      vertexShader: pixelVertexShader,
      fragmentShader: pixelFragmentShader,
      transparent: true,
      // Change blending mode
      blending: THREE.NormalBlending,
      depthWrite: false
    });
  }, []);

  // Create particles with initial properties
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        // Start at the local origin (offset by position prop)
        position: localBasePosition.clone(), 
        velocity: new THREE.Vector3(), 
        rotation: new THREE.Euler(0, 0, Math.random() * Math.PI * 2),
        rotationSpeed: (Math.random() - 0.5) * 3,
        color: new THREE.Color(`hsl(0, 0%, ${85 + Math.random() * 15}%)`),
        life: 0, // Start invisible
        maxLife: 1.0 + Math.random() * 0.8, // Increased lifespan (1.0s to 1.8s)
        size: 0.05 + Math.random() * 0.1,
        material: shaderMaterial.clone()
      });
      temp[i].material.uniforms.color.value = temp[i].color;
    }
    return temp;
  }, [count, localBasePosition, shaderMaterial]);

  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // --- DEBUGGING LOG --- 
    frameCount.current++;
    if (frameCount.current % 60 === 0) { // Log every 60 frames
        console.log(`PixelSmokeEffect Frame: ${frameCount.current}, isLaunched: ${isLaunched}, Particle 0 life: ${particles[0]?.life.toFixed(2)}`);
    }
    // --- END DEBUGGING LOG --- 

    // Physics parameters
    const fadeSpeed = 1.0; // Keep fade speed relative
    const spreadFactor = explosionSpeed * 1.4; // Increased spread slightly
    const downwardBias = -0.03; // Slightly stronger downward drift
    const drag = 0.94; // Reduced drag slightly

    particles.forEach((p) => {
      // If not launched, keep particles dead/invisible
      if (!isLaunched) {
        if (p.life !== 0) { // Only reset if needed
            p.life = 0;
            p.position.copy(localBasePosition);
            p.velocity.set(0,0,0);
            p.material.uniforms.opacity.value = 0;
        }
        return;
      }

      // If particle is dead, respawn it at the origin for continuous trail
      if (p.life <= 0) {
        p.position.copy(localBasePosition);
        p.velocity.set(
          (Math.random() - 0.5) * spreadFactor,
          downwardBias + (Math.random() - 0.7) * explosionSpeed * 1.1, // Adjusted Y velocity bias
          (Math.random() - 0.5) * spreadFactor
        );
        p.life = p.maxLife;
        p.rotation.set(0, 0, Math.random() * Math.PI * 2);
        // DEBUG: Force opacity on respawn for testing
        // p.material.uniforms.opacity.value = 1.0; 
      }

      // Apply velocity and drag (no gravity needed as it moves with parent)
      p.velocity.multiplyScalar(drag);
      p.position.addScaledVector(p.velocity, delta * 60); 
      p.rotation.z += p.rotationSpeed * delta;

      // Fade out over time
      p.life -= (fadeSpeed / p.maxLife) * delta;
      
      // DEBUG: Force opacity to 1 to rule out fade/shader issues
      // p.material.uniforms.opacity.value = 1.0; 
      // Original line: Restore this
      p.material.uniforms.opacity.value = Math.max(0, p.life); 
      
    });
  });

  return (
    // Group is positioned locally by the parent
    <group ref={groupRef}>
      {particles.map((p, i) => (
        // Render particle only if its life > 0
        // DEBUG: Render even if life is 0 when launched to see if they exist
        // Always render if launched, ignore life for visibility check now
        isLaunched && (
          <mesh 
            key={i} 
            // Particle mesh position is relative to this group's origin
            position={p.position} 
            rotation={p.rotation}
            // DEBUG: Removed visibility check based on life
            // visible={p.life > 0} 
          >
            <planeGeometry args={[p.size, p.size]} />
            <primitive object={p.material} attach="material" />
          </mesh>
        )
      ))}
    </group>
  );
} 