import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Enhanced particle constants for more dramatic visual effect
const PARTICLE_COUNT = 2500; // Increased for denser trail
const PARTICLE_SIZE = 0.15; // Slightly larger particles for better visibility
const MAX_LIFE = 8; // Longer max lifetime for longer trails
const MIN_LIFE = 4; // Minimum lifetime
const SPAWN_RATE = 25; // Higher spawn rate
const INITIAL_Y_VELOCITY = -3.5; // Increased downward velocity
const SPREAD_FACTOR = 3.0; // Wider spread for more voluminous smoke
const DRAG_FACTOR = 0.98; // Slight drag for realistic physics
const SMALL_OFFSET_FACTOR = 0.4; // Slightly larger spawn area
const GRAVITY = 0.002; // Add gravity effect

// Vertex Shader with improved handling
const vertexShader = `
  varying vec2 vUv;
  attribute vec3 instanceColor;
  attribute float instanceOpacity;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vUv = uv;
    vColor = instanceColor;
    vOpacity = instanceOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader with better pixel effect
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    // Create a sharp-edged, pixel-like particle
    float threshold = 0.45;
    float edge = 0.03; // Narrower edge for sharper pixels
    float dx = abs(vUv.x - 0.5);
    float dy = abs(vUv.y - 0.5);
    float dist = max(dx, dy);
    float intensity = smoothstep(threshold + edge, threshold, dist);
    
    // Discard transparent pixels for better performance
    if (intensity < 0.01) discard;
    
    // Output color with intensity modulation
    gl_FragColor = vec4(vColor, vOpacity * intensity);
  }
`;

// Helper objects
const dummy = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();
const tempColor = new THREE.Color();

const PixelSmokeEffect = ({ rocketWorldPos, directEmitter, isLaunched = false }) => {
  const particlesRef = useRef();
  const emitterRef = useRef(new THREE.Vector3().copy(rocketWorldPos || new THREE.Vector3(0, -1000, 0)));
  const [spawnIndex, setSpawnIndex] = useState(0);
  const lastSpawnTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  // Base geometry for particles
  const geometry = useMemo(() => new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE), []);

  // Shader material with improved settings
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {},
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending, // Changed to additive for better glow
    side: THREE.DoubleSide
  }), []);

  // Initialize particle state and buffer attributes
  const particleState = useMemo(() => {
    const state = [];
    const initialColor = new Float32Array(PARTICLE_COUNT * 3);
    const initialOpacity = new Float32Array(PARTICLE_COUNT);
    const initialScale = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Particle color - warm orange/red hues for realistic rocket exhaust
      const hue = 0.05 + Math.random() * 0.1; // Orange-red hue range
      const saturation = 0.7 + Math.random() * 0.3;
      const lightness = 0.6 + Math.random() * 0.3;
      
      tempColor.setHSL(hue, saturation, lightness);
      tempColor.toArray(initialColor, i * 3);
      
      // Initial state (off-screen)
      state.push({
        position: new THREE.Vector3(0, -1000, 0), 
        velocity: new THREE.Vector3(),
        rotation: new THREE.Euler(0, 0, Math.random() * Math.PI * 2),
        rotationSpeed: (Math.random() - 0.5) * 2.0,
        life: 0,
        maxLife: MIN_LIFE + Math.random() * (MAX_LIFE - MIN_LIFE),
        opacity: 0,
        scale: 0.7 + Math.random() * 0.6, // Varied scales for visual interest
        color: new THREE.Color(tempColor.r, tempColor.g, tempColor.b)
      });

      // Initialize attributes
      initialOpacity[i] = 0;
      initialScale[i] = state[i].scale;

      // Set initial matrix
      dummy.position.copy(state[i].position);
      dummy.rotation.copy(state[i].rotation);
      dummy.scale.set(state[i].scale, state[i].scale, state[i].scale);
      dummy.updateMatrix();
    }
    
    return { state, initialColor, initialOpacity, initialScale };
  }, []);

  // Update emitter reference when rocket position changes
  useEffect(() => {
    if (rocketWorldPos) {
      emitterRef.current.copy(rocketWorldPos);
    }
  }, [rocketWorldPos]);

  // Setup instance attributes
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const mesh = particlesRef.current;
    const instancedGeometry = geometry;

    mesh.geometry.setAttribute('instanceColor', 
      new THREE.InstancedBufferAttribute(particleState.initialColor, 3));
    mesh.geometry.setAttribute('instanceOpacity', 
      new THREE.InstancedBufferAttribute(particleState.initialOpacity, 1));
    
    mesh.geometry.attributes.instanceColor.needsUpdate = true;
    mesh.geometry.attributes.instanceOpacity.needsUpdate = true;
  }, [geometry, particleState]);

  // Main animation frame handler
  useFrame((state, delta) => {
    if (!particlesRef.current || !isLaunched) return;

    // Use the direct emitter reference if available or fall back to React state
    const emitterPos = directEmitter || emitterRef.current;
    
    // Performance optimization: throttle updates on high refresh rates
    frameCountRef.current++;
    if (frameCountRef.current % 2 !== 0) return;
    
    const mesh = particlesRef.current;
    const positionAttribute = mesh.instanceMatrix;
    if (!positionAttribute) return;
    
    const opacityAttribute = mesh.geometry.attributes.instanceOpacity;
    if (!opacityAttribute) return;

    // Track statistics
    let activeParticles = 0;
    
    // Update existing particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleState.state[i];

      if (p.life > 0) {
        activeParticles++;
        
        // Physics update
        p.velocity.multiplyScalar(DRAG_FACTOR);
        p.velocity.x += (Math.random() - 0.5) * 0.3;
        p.velocity.z += (Math.random() - 0.5) * 0.3;
        p.velocity.y += (Math.random() - 0.5) * 0.15; 
        p.velocity.y -= GRAVITY;
        p.position.addScaledVector(p.velocity, delta * 2);
        p.rotation.z += p.rotationSpeed * delta;
        p.life -= delta;
        
        // Fade out at end of life
        const fadeTime = p.maxLife * 0.3;
        p.opacity = p.life <= fadeTime ? p.life / fadeTime : 1;

        // Update matrix
        if (p.life > 0) {
          dummy.position.copy(p.position);
          dummy.rotation.copy(p.rotation);
          dummy.scale.set(p.scale, p.scale, p.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          opacityAttribute.setX(i, p.opacity);
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          opacityAttribute.setX(i, 0);
        }
      }
    }

    // Spawn new particles at controlled rate
    const currentTime = state.clock.getElapsedTime();
    const elapsedTime = currentTime - lastSpawnTimeRef.current;

    if (elapsedTime > 0.016) { // ~60fps rate limiting
      lastSpawnTimeRef.current = currentTime;

      let spawnCount = 0;
      let attempts = 0;
      let currentIndex = spawnIndex;

      while (spawnCount < SPAWN_RATE && attempts < PARTICLE_COUNT) {
        attempts++;
        const p = particleState.state[currentIndex];

        if (p.life <= 0) {
          // Reset particle at rocket position with offset
          p.position.copy(emitterPos).add(
            tempVec3.set(
              (Math.random() - 0.5) * SMALL_OFFSET_FACTOR,
              (Math.random() - 0.5) * SMALL_OFFSET_FACTOR * 0.2,
              (Math.random() - 0.5) * SMALL_OFFSET_FACTOR
            )
          );

          // Set velocity
          p.velocity.set(
            (Math.random() - 0.5) * SPREAD_FACTOR,
            INITIAL_Y_VELOCITY * (0.7 + Math.random() * 0.6),
            (Math.random() - 0.5) * SPREAD_FACTOR
          );

          // Reset lifecycle
          p.life = p.maxLife;
          p.opacity = 1;
          p.rotation.z = Math.random() * Math.PI * 2;

          // Update matrix
          dummy.position.copy(p.position);
          dummy.rotation.copy(p.rotation);
          dummy.scale.set(p.scale, p.scale, p.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(currentIndex, dummy.matrix);
          opacityAttribute.setX(currentIndex, p.opacity);

          spawnCount++;
        }

        currentIndex = (currentIndex + 1) % PARTICLE_COUNT;
      }

      setSpawnIndex(currentIndex);
    }

    // Update instance attributes
    positionAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particlesRef} args={[geometry, material, PARTICLE_COUNT]}>
      <primitive object={geometry} attach="geometry" />
    </instancedMesh>
  );
};

export default PixelSmokeEffect;