import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('RocketTransition', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does not render when startTransition is false', () => {
    vi.doMock('./RocketCanvas', () => ({
      __esModule: true,
      default: (props) => <div data-testid="rocket-canvas" {...props} />,
    }));
    const RocketTransition = require('./RocketTransition').default;
    const { container } = render(<RocketTransition startTransition={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders RocketCanvas when startTransition is true', async () => {
    vi.doMock('./RocketCanvas', () => ({
      __esModule: true,
      default: (props) => <div data-testid="rocket-canvas" {...props} />,
    }));
    const RocketTransition = require('./RocketTransition').default;
    render(<RocketTransition startTransition={true} />);
    const canvas = await screen.findByTestId('rocket-canvas');
    expect(canvas).toBeDefined();
  });

  it('does not pass isLaunched or onTransitionComplete to DOM', () => {
    vi.doMock('./RocketCanvas', () => ({
      __esModule: true,
      default: (props) => {
        if ('isLaunched' in props || 'onTransitionComplete' in props) {
          throw new Error('DOM prop leakage detected');
        }
        return <div data-testid="rocket-canvas" {...props} />;
      },
    }));
    const RocketTransition = require('./RocketTransition').default;
    expect(() => {
      render(<RocketTransition startTransition={true} />);
    }).not.toThrow();
  });
});