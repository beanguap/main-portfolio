import { useFrame } from '@react-three/fiber';
import { device } from '@utils/device'; // Import centralized device object
import { useEffect, useMemo, useRef } from 'react';
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

// Hoist reusable THREE objects
const tempColor = new THREE.Color();
const tempVec3 = new THREE.Vector3();

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
    new THREE.Vector3().copy(rocketWorldPos || tempVec3.set(0, -1000, 0)) // Use tempVec3
  );
  const spawnIndexRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []); // Keep dummy for matrix updates

  // Dirty flags/queue for optimized updates
  const dirtyMatricesRef = useRef(new Set());
  const dirtyOpacitiesRef = useRef(new Set());

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
      geometry?.dispose();
      material?.dispose();
    };
  }, [geometry, material]);

  // Initialize particle state and buffer attributes
  const particleState = useMemo(() => {
    const state = [];
    const initialColor = new Float32Array(PARTICLE_COUNT * 3);
    const initialOpacity = new Float32Array(PARTICLE_COUNT);

    const localDummy = new THREE.Object3D(); // Keep local dummy for initialization

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Particle color - warm orange/red hues for realistic rocket exhaust
      tempColor.setHSL(
        0.05 + Math.random() * 0.1,
        0.7 + Math.random() * 0.3,
        0.6 + Math.random() * 0.3
      );
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
        scale: 0.7 + Math.random() * 0.6,
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
  }, []);

  // Update emitter reference when rocket position changes
  useEffect(() => {
    if (directEmitter) { // Prefer directEmitter if available
        emitterRef.current.copy(directEmitter);
    } else if (rocketWorldPos) {
      emitterRef.current.copy(rocketWorldPos);
    }
  }, [rocketWorldPos, directEmitter]);

  // Setup instance attributes
  useEffect(() => {
    if (!particlesRef.current) return;
    const mesh = particlesRef.current;

    // Ensure geometry exists before setting attributes
    if (!mesh.geometry.getAttribute('instanceColor')) {
        mesh.geometry.setAttribute(
          'instanceColor',
          new THREE.InstancedBufferAttribute(particleState.initialColor, 3)
        );
    }
     if (!mesh.geometry.getAttribute('instanceOpacity')) {
        mesh.geometry.setAttribute(
          'instanceOpacity',
          new THREE.InstancedBufferAttribute(particleState.initialOpacity, 1)
        );
     }
  }, [geometry, particleState]);

  // Main animation frame handler - Use dummy object and dirty flags
  useFrame((state, delta) => {
    if (!particlesRef.current || !isLaunched) return;

    const emitterPos = directEmitter || emitterRef.current; // Use directEmitter if passed

    frameCountRef.current++;
    // Use centralized device check
    if (frameCountRef.current % 2 !== 0 && !device.isMobile) return;

    const mesh = particlesRef.current;
    const matrixAttribute = mesh.instanceMatrix;
    const opacityAttribute = mesh.geometry.attributes.instanceOpacity;

    if (!matrixAttribute || !opacityAttribute) return;

    const time = state.clock.getElapsedTime();
    let currentIndex = spawnIndexRef.current;
    const dirtyMatrices = dirtyMatricesRef.current;
    const dirtyOpacities = dirtyOpacitiesRef.current;

    // Update existing particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleState.state[i];

      if (p.life > 0) {
        // Physics update
        p.velocity.multiplyScalar(DRAG_FACTOR);
        p.velocity.x += (Math.random() - 0.5) * 0.3;
        p.velocity.y += GRAVITY;
        p.velocity.z += (Math.random() - 0.5) * 0.3;
        p.position.addScaledVector(p.velocity, delta);
        p.rotation.z += p.rotationSpeed * delta;
        p.life -= delta;

        // Fade out
        const newOpacity = Math.max(0, (p.life / p.maxLife) * 0.8);
        if (p.opacity !== newOpacity) {
            p.opacity = newOpacity;
            dirtyOpacities.add(i);
        }

        // Update matrix using the dummy object
        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        dirtyMatrices.add(i);

      } else if (p.opacity > 0) { // Ensure dead particles are marked dirty once
        p.opacity = 0;
        dummy.scale.set(0, 0, 0); // Make invisible
        dummy.updateMatrix();
        dirtyMatrices.add(i);
        dirtyOpacities.add(i);
      }
    }

    // Spawn new particles
    const timeSinceLastSpawn = time - lastSpawnTimeRef.current;
    const spawnCount = Math.min(
      PARTICLE_COUNT,
      Math.floor(timeSinceLastSpawn * SPAWN_RATE)
    );

    if (spawnCount > 0) {
      lastSpawnTimeRef.current = time;
      for (let i = 0; i < spawnCount; i++) {
        const spawnIdx = (currentIndex + i) % PARTICLE_COUNT; // Wrap index
        const p = particleState.state[spawnIdx];

        // Reset particle state at emitter position
        p.position.copy(emitterPos);

        // Add small random offset using tempVec3
        tempVec3.set(
            (Math.random() - 0.5) * SMALL_OFFSET_FACTOR,
            (Math.random() - 0.5) * SMALL_OFFSET_FACTOR,
            (Math.random() - 0.5) * SMALL_OFFSET_FACTOR
        );
        p.position.add(tempVec3);

        // Initial velocity using tempVec3
        p.velocity.set(
          (Math.random() - 0.5) * SPREAD_FACTOR,
          INITIAL_Y_VELOCITY + (Math.random() - 0.5) * 1.5,
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
        dirtyMatrices.add(spawnIdx);
        dirtyOpacities.add(spawnIdx);
      }
      spawnIndexRef.current = (currentIndex + spawnCount) % PARTICLE_COUNT; // Update spawn index with wrap
    }

    // Apply updates only for dirty particles
    if (dirtyMatrices.size > 0) {
        dirtyMatrices.forEach(index => {
            const p = particleState.state[index];
            if (p.life <= 0) {
                dummy.scale.set(0,0,0); // Ensure dead particles are scaled to 0
            } else {
                dummy.position.copy(p.position);
                dummy.rotation.copy(p.rotation);
                dummy.scale.set(p.scale, p.scale, p.scale);
            }
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
        });
        matrixAttribute.needsUpdate = true;
        dirtyMatrices.clear();
    }

    if (dirtyOpacities.size > 0) {
        dirtyOpacities.forEach(index => {
            opacityAttribute.setX(index, particleState.state[index].opacity);
        });
        opacityAttribute.needsUpdate = true;
        dirtyOpacities.clear();
    }
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
