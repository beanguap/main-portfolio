import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, it, expect } from 'vitest';
import PixelSmokeEffect from './PixelSmokeEffect';
import * as THREE from 'three'; // Import THREE to use constructors

describe('PixelSmokeEffect Scene tests', () => {
  it('renders an InstancedMesh in the scene', async () => {
    // Render using the correct method
    const renderer = await ReactThreeTestRenderer.create(
      <PixelSmokeEffect rocketWorldPos={[0, 0, 0]} isLaunched={true} /> // Ensure isLaunched=true for particles to spawn
    );
    
    // Find the InstancedMesh instance using the constructor instead of string
    const instancedMesh = renderer.scene.findByType(THREE.InstancedMesh);
    
    expect(instancedMesh).toBeDefined();
    // Check if the count prop matches the expected PARTICLE_COUNT
    // Note: PARTICLE_COUNT is defined inside PixelSmokeEffect.jsx, 
    // we might need to export it or use a known value if testing count is critical.
    // For now, just checking existence.
  });
});