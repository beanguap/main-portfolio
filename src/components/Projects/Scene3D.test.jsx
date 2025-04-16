import { describe, it, expect } from 'vitest';
import { Scene3D } from './Scene3D';
import { render } from '@testing-library/react';

describe('Scene3D', () => {
  it('renders without crashing', () => {
    render(<Scene3D projects={[]} />);
    expect(true).toBe(true); // Placeholder
  });
});
