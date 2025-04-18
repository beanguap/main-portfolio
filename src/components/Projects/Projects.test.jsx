import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Projects from './Projects';

describe('Projects', () => {
  it('renders project section heading', () => {
    render(<Projects />);
    // The heading is split: <span>Featured</span> Projects
    const heading = screen.getByRole('heading', {
      name: (_content, _element) =>
        /featured/i.test(_content) && /projects/i.test(_content),
    });
    expect(heading).toBeInTheDocument();
  });
});
