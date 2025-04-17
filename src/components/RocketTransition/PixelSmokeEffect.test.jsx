import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import PixelSmokeEffect from './PixelSmokeEffect';

describe('PixelSmokeEffect Scene tests', () => {
  it('renders an InstancedMesh in the scene', async () => {
    // Ensure necessary props are provided
    const mockPosition = new THREE.Vector3(0, 0, 0);

    // Await the creation as rendering might involve effects or async setup
    const renderer = await ReactThreeTestRenderer.create(
      <PixelSmokeEffect position={mockPosition} count={50} /> // Provide props
    );

    // Add a small delay or use renderer.advanceFrames() if useFrame logic needs time
    // await new Promise(resolve => setTimeout(resolve, 100)); // Optional delay
    // renderer.advanceFrames(2); // Optional frame advance

    // Find the InstancedMesh instance using the constructor
    // Use findByType which is generally more reliable
    const instancedMesh = renderer.scene.findByType(THREE.InstancedMesh);

    // Assertion
    expect(instancedMesh).toBeDefined();
    expect(instancedMesh.count).toBe(50); // Check count prop if relevant

    // Clean up
    renderer.unmount();
  });
});