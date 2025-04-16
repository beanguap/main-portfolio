import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Projects from './Projects';

describe('Projects', () => {
  it('renders project section heading', () => {
    render(<Projects />);
    expect(screen.getByText(/Featured Projects/i)).toBeInTheDocument();
  });
});
