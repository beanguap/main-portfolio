import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock react-three-fiber hooks and Canvas
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
  Canvas: ({ children }) => <>{children}</>,
}));

// Mock three.js InstancedMesh and related classes
vi.mock('three', () => ({
  InstancedMesh: (props) => <div data-testid="instanced-mesh" {...props} />,
  Object3D: class {},
  Color: class {
    setHSL() { return this; }
    toArray(arr, i) { if (arr) arr[i] = 1; return arr; }
    constructor(r = 1, g = 1, b = 1) { this.r = r; this.g = g; this.b = b; }
  },
  Matrix4: class {},
  Vector3: class {
    copy() { return this; }
    clone() { return this; }
    set() { return this; }
    add() { return this; }
    addScaledVector() { return this; }
    multiplyScalar() { return this; }
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  },
  BoxGeometry: class {},
  MeshStandardMaterial: class {},
  PlaneGeometry: class {},
  ShaderMaterial: class {},
  AdditiveBlending: 2,
  DoubleSide: 2,
  InstancedBufferAttribute: class {},
  Euler: class {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  }
}));

import PixelSmokeEffect from './PixelSmokeEffect';

describe('PixelSmokeEffect', () => {
  it('renders InstancedMesh wrapper', () => {
    const { getByTestId } = render(
      <PixelSmokeEffect rocketWorldPos={[0, 0, 0]} isLaunched={false} />
    );
    expect(getByTestId('instanced-mesh')).toBeInTheDocument();
  });
});