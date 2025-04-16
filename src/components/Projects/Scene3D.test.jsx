import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Stub react-three-fiber for tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <>{children}</>,
  useFrame: () => {},
  useThree: () => ({ viewport: { height: 100 } }),
}));

import { Scene3D } from './Scene3D';

describe('Scene3D', () => {
  it('renders without crashing', () => {
    render(<Scene3D projects={[]} />);
    expect(true).toBe(true); // Placeholder
  });
});
