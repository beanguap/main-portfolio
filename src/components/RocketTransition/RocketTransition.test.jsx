import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Remove RTTR import if no longer used in this file
// import ReactThreeTestRenderer from '@react-three/test-renderer';
import RocketTransition from './RocketTransition';
import * as THREE from 'three'; // Keep THREE if needed for mocks

// Mock child components, especially the Canvas one
vi.mock('./RocketCanvas', () => ({
  default: ({ onLaunched }) => {
    // Simulate calling onLaunched after a delay if needed for testing
    // setTimeout(onLaunched, 100);
    return <div data-testid="mock-rocket-canvas">Mock Rocket Canvas</div>;
  },
}));

// Mock sound hook
vi.mock('use-sound', () => ({
  default: () => [vi.fn(), { stop: vi.fn() }], // Mock the hook return value
}));

describe('RocketTransition DOM tests', () => {
  it('does not render RocketCanvas when startTransition is false', () => {
    render(<RocketTransition startTransition={false} onTransitionComplete={vi.fn()} />);
    // Expect the canvas mock *not* to be present
    expect(screen.queryByTestId('mock-rocket-canvas')).toBeNull();
    // You might check for placeholder content if applicable
  });

  it('renders RocketCanvas component when startTransition is true', () => {
    render(<RocketTransition startTransition={true} onTransitionComplete={vi.fn()} />);
    // Expect the canvas mock *to be* present
    expect(screen.getByTestId('mock-rocket-canvas')).toBeInTheDocument();
  });

  // Add tests for onTransitionComplete callback if needed
});

// Remove the failing 'RocketTransition Scene tests' describe block
// describe('RocketTransition Scene tests', () => {
//   it('renders RocketCanvas component when startTransition is true', async () => {
//     // This test was incorrect - RTTR should not render RocketTransition directly
//     // Scene testing should happen in RocketCanvas tests or its children's tests
//   });
// });