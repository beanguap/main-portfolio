import { useFrame } from '@react-three/fiber';
import { isMobile } from '@utils/device'; // Import mobile detection
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Adjust particle count based on device
const BASE_PARTICLE_COUNT = isMobile() ? 800 : 2500; // Reduced count for mobile
const PARTICLE_COUNT = BASE_PARTICLE_COUNT;
const PARTICLE_SIZE = isMobile() ? 0.12 : 0.15;
const MAX_LIFE = isMobile() ? 6 : 8;
const MIN_LIFE = isMobile() ? 3 : 4;
const SPAWN_RATE = isMobile() ? 15 : 25;
const INITIAL_Y_VELOCITY = isMobile() ? -2.5 : -3.5;
const SPREAD_FACTOR = isMobile() ? 2.0 : 3.0;
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

const PixelSmokeEffect = ({
  rocketWorldPos,
  directEmitter,
  isLaunched = false,
}) => {
  const particlesRef = useRef();
  const emitterRef = useRef(
    new THREE.Vector3().copy(rocketWorldPos || new THREE.Vector3(0, -1000, 0))
  );
  const spawnIndexRef = useRef(0); // Use ref instead of state
  const lastSpawnTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []); // Hoist dummy

  // Base geometry for particles
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE),
    []
  );

  // Shader material with improved settings
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {},
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending, // Changed to additive for better glow
        side: THREE.DoubleSide,
      }),
    []
  );

  // Cleanup geometry and material
  useEffect(() => {
    return () => {
      if (particlesRef.current) particlesRef.current.dispose();
      geometry?.dispose();
      material?.dispose();
    };
  }, [geometry, material]);

  // Initialize particle state and buffer attributes
  const particleState = useMemo(() => {
    const state = [];
    const initialColor = new Float32Array(PARTICLE_COUNT * 3);
    const initialOpacity = new Float32Array(PARTICLE_COUNT);
    const tempColor = new THREE.Color(); // Reuse color object
    const localDummy = new THREE.Object3D(); // Keep local dummy for initialization

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
        color: new THREE.Color(tempColor.r, tempColor.g, tempColor.b),
      });

      // Initialize attributes
      initialOpacity[i] = 0;

      // Set initial matrix using the local dummy object
      localDummy.position.copy(state[i].position);
      localDummy.rotation.copy(state[i].rotation);
      localDummy.scale.set(state[i].scale, state[i].scale, state[i].scale);
      localDummy.updateMatrix();
    }

    return { state, initialColor, initialOpacity };
  }, []); // Removed PARTICLE_COUNT dependency as it's constant within component lifecycle

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

    mesh.geometry.setAttribute(
      'instanceColor',
      new THREE.InstancedBufferAttribute(particleState.initialColor, 3)
    );
    mesh.geometry.setAttribute(
      'instanceOpacity',
      new THREE.InstancedBufferAttribute(particleState.initialOpacity, 1)
    );

    mesh.geometry.attributes.instanceColor.needsUpdate = true;
    mesh.geometry.attributes.instanceOpacity.needsUpdate = true;
  }, [geometry, particleState]);

  // Main animation frame handler - Use dummy object
  useFrame((state, delta) => {
    if (!particlesRef.current || !isLaunched) return;

    const emitterPos = directEmitter || emitterRef.current;

    frameCountRef.current++;
    if (frameCountRef.current % 2 !== 0 && !isMobile()) return; // Keep throttling on non-mobile

    const mesh = particlesRef.current;
    const positionAttribute = mesh.instanceMatrix; // This is the matrix attribute
    if (!positionAttribute) return;

    const opacityAttribute = mesh.geometry.attributes.instanceOpacity;
    if (!opacityAttribute) return;

    const time = state.clock.getElapsedTime();
    let currentIndex = spawnIndexRef.current;

    // Update existing particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleState.state[i];

      if (p.life > 0) {
        // Physics update
        p.velocity.multiplyScalar(DRAG_FACTOR);
        p.velocity.x += (Math.random() - 0.5) * 0.3;
        p.velocity.y += GRAVITY; // Apply gravity
        p.velocity.z += (Math.random() - 0.5) * 0.3;
        p.position.addScaledVector(p.velocity, delta);
        p.rotation.z += p.rotationSpeed * delta;
        p.life -= delta;

        // Fade out
        p.opacity = Math.max(0, (p.life / p.maxLife) * 0.8); // Ensure opacity doesn't exceed 1

        // Update matrix using the dummy object
        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        opacityAttribute.setX(i, p.opacity);
      } else {
        // Mark as dead (invisible)
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        opacityAttribute.setX(i, 0);
      }
    }

    // Spawn new particles
    const timeSinceLastSpawn = time - lastSpawnTimeRef.current;
    const spawnCount = Math.min(
      PARTICLE_COUNT - currentIndex, // Don't exceed count
      Math.floor(timeSinceLastSpawn * SPAWN_RATE)
    );

    if (spawnCount > 0) {
      lastSpawnTimeRef.current = time;
      for (let i = 0; i < spawnCount; i++) {
        const p = particleState.state[currentIndex];

        // Reset particle state at emitter position
        p.position.copy(emitterPos);
        // Add small random offset
        p.position.x += (Math.random() - 0.5) * SMALL_OFFSET_FACTOR;
        p.position.y += (Math.random() - 0.5) * SMALL_OFFSET_FACTOR;
        p.position.z += (Math.random() - 0.5) * SMALL_OFFSET_FACTOR;

        // Initial velocity
        p.velocity.set(
          (Math.random() - 0.5) * SPREAD_FACTOR,
          INITIAL_Y_VELOCITY + (Math.random() - 0.5) * 1.5, // Add some variance
          (Math.random() - 0.5) * SPREAD_FACTOR
        );
        p.life = p.maxLife;
        p.opacity = 0.8;
        p.rotation.z = Math.random() * Math.PI * 2;

        // Update matrix for the newly spawned particle
        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(currentIndex, dummy.matrix);

        opacityAttribute.setX(currentIndex, p.opacity);

        currentIndex = (currentIndex + 1) % PARTICLE_COUNT;
      }
      spawnIndexRef.current = currentIndex;
    }

    // Mark attributes for update
    positionAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={particlesRef}
      args={[geometry, material, PARTICLE_COUNT]}
    >
      <primitive object={geometry} attach="geometry" />
    </instancedMesh>
  );
};

export default PixelSmokeEffect;
