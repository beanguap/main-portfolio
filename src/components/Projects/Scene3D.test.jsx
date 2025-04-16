import React from 'react';
import { render as renderR3f } from '@react-three/test-renderer';
import { describe, it, expect } from 'vitest';
import { Scene3D } from './Scene3D'; // Assuming Scene3D is the component to test

// No need for manual vi.mock calls - handled by vitest.setup.js

describe('Scene3D Scene tests', () => {
  it('renders without crashing and contains expected elements', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', imageUrl: 'test.jpg', links: { github: '', demo: '' }, tech: [] },
      // Add more mock projects if needed
    ];
    
    const instance = await renderR3f(<Scene3D projects={mockProjects} />);
    
    // Example assertion: Check if the scene contains a Group or specific meshes
    // This depends heavily on the actual structure of your Scene3D component
    const groupElement = instance.scene.findByType('Group'); // Or 'Mesh', 'AmbientLight', etc.
    expect(groupElement).toBeDefined();

    // Example: Check if ProjectCard components are rendered (assuming ProjectCard is identifiable)
    // This might require ProjectCard to be exported or have a specific type/prop
    // const projectCards = instance.root.findAllByType('ProjectCard'); 
    // expect(projectCards.length).toBe(mockProjects.length);

    // Example: Check for ParticleField
    const particleField = instance.root.findByType('ParticleField');
    expect(particleField).toBeDefined();
  });
});
