import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, it, expect } from 'vitest';
import { Scene3D } from './Scene3D';
import * as THREE from 'three'; // Import THREE to use constructors

describe('Scene3D Scene tests', () => {
  it('renders without crashing and contains expected elements', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', imageUrl: 'test.jpg', links: { github: '', demo: '' }, tech: [] },
      // Add more mock projects if needed
    ];
    
    // Render using the correct method
    const renderer = await ReactThreeTestRenderer.create(<Scene3D projects={mockProjects} />);
    
    // Access scene via renderer.scene
    const groupElement = renderer.scene.findByType(THREE.Group);
    expect(groupElement).toBeDefined();
  });
});
