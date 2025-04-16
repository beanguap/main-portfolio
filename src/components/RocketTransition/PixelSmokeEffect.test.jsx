import React from 'react';
import { render as renderR3f } from '@react-three/test-renderer';
import { describe, it, expect } from 'vitest';
import PixelSmokeEffect from './PixelSmokeEffect';

// No need for manual vi.mock calls - handled by vitest.setup.js

describe('PixelSmokeEffect Scene tests', () => {
  it('renders an InstancedMesh in the scene', async () => {
    // Render using the R3F test renderer
    const instance = await renderR3f(
      <PixelSmokeEffect rocketWorldPos={[0, 0, 0]} isLaunched={false} />
    );
    
    // Find the InstancedMesh instance within the virtual scene graph
    const instancedMesh = instance.scene.findByType('InstancedMesh');
    
    expect(instancedMesh).toBeDefined();
    // Check if the count prop matches the expected PARTICLE_COUNT
    // Note: PARTICLE_COUNT is defined inside PixelSmokeEffect.jsx, 
    // we might need to export it or use a known value if testing count is critical.
    // For now, just checking existence.
    // expect(instancedMesh.props.args[2]).toBe(PARTICLE_COUNT); // Example if args holds count
  });
});