/**
 * SkeletonCard Component Tests
 * Tests for loading skeleton rendering
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SkeletonCard from '../SkeletonCard';

describe('SkeletonCard Component', () => {
  it('renders skeleton card for light theme', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const card = container.querySelector('.skeleton-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('light');
  });

  it('renders skeleton card for dark theme', () => {
    const { container } = render(<SkeletonCard isDark={true} />);
    const card = container.querySelector('.skeleton-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('dark');
  });

  it('renders skeleton image element', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const image = container.querySelector('.skeleton-image');
    expect(image).toBeInTheDocument();
  });

  it('renders skeleton content container', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const content = container.querySelector('.skeleton-content');
    expect(content).toBeInTheDocument();
  });

  it('renders all skeleton placeholder elements', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const placeholders = container.querySelectorAll('[class^="skeleton-"]');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('renders source placeholder', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const source = container.querySelector('.skeleton-source');
    expect(source).toBeInTheDocument();
  });

  it('renders title placeholders', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const title = container.querySelector('.skeleton-title');
    const titleShort = container.querySelector('.skeleton-title-short');
    expect(title).toBeInTheDocument();
    expect(titleShort).toBeInTheDocument();
  });

  it('renders description placeholders', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const description = container.querySelector('.skeleton-description');
    const descriptionShort = container.querySelector('.skeleton-description-short');
    expect(description).toBeInTheDocument();
    expect(descriptionShort).toBeInTheDocument();
  });

  it('renders meta placeholder', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const meta = container.querySelector('.skeleton-meta');
    expect(meta).toBeInTheDocument();
  });

  it('renders link placeholder', () => {
    const { container } = render(<SkeletonCard isDark={false} />);
    const link = container.querySelector('.skeleton-link');
    expect(link).toBeInTheDocument();
  });
});
