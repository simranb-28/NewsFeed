/**
 * NewsCard Component Tests
 * Tests for individual article card rendering and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsCard from '../NewsCard';

// Mock the theme context
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

describe('NewsCard Component', () => {
  const mockArticle = {
    title: 'Breaking News: React 20 Released',
    description: 'A revolutionary new version of React has been released with major improvements.',
    urlToImage: 'https://example.com/image.jpg',
    url: 'https://example.com/article',
    source: { name: 'Tech News Daily' },
    publishedAt: '2024-03-08T10:00:00Z',
    author: 'John Doe',
  };

  it('renders article title', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('renders article description', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.description)).toBeInTheDocument();
  });

  it('renders source name', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('Tech News Daily')).toBeInTheDocument();
  });

  it('renders "Read More" link with correct href', () => {
    render(<NewsCard article={mockArticle} />);
    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('href', mockArticle.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders author information when available', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText(/by John Doe/i)).toBeInTheDocument();
  });

  it('does not render author when not available', () => {
    const articleWithoutAuthor = { ...mockArticle, author: null };
    render(<NewsCard article={articleWithoutAuthor} />);
    expect(screen.queryByText(/by/i)).not.toBeInTheDocument();
  });

  it('renders image when URL is provided', () => {
    render(<NewsCard article={mockArticle} />);
    const image = screen.getByAltText(mockArticle.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockArticle.urlToImage);
  });

  it('renders placeholder when image URL is missing', () => {
    const articleWithoutImage = { ...mockArticle, urlToImage: null };
    render(<NewsCard article={articleWithoutImage} />);
    expect(screen.getByText('📰')).toBeInTheDocument();
  });

  it('shows placeholder when image fails to load', async () => {
    const user = userEvent.setup();
    render(<NewsCard article={mockArticle} />);
    
    const image = screen.getByAltText(mockArticle.title);
    await user.pointer({ keys: '[MouseLeft]', target: image });
    
    // Simulate image load error
    image.onerror?.();
    
    // Check if placeholder appears
    expect(screen.getByText('📰')).toBeInTheDocument();
  });

  it('formats recent dates correctly', () => {
    const recentArticle = {
      ...mockArticle,
      publishedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    };
    render(<NewsCard article={recentArticle} />);
    expect(screen.getByText(/30m ago/i)).toBeInTheDocument();
  });

  it('formats old dates correctly', () => {
    const oldArticle = {
      ...mockArticle,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(), // 5 days ago
    };
    render(<NewsCard article={oldArticle} />);
    expect(screen.getByText(/5d ago/i)).toBeInTheDocument();
  });

  it('has proper image lazy loading attribute', () => {
    render(<NewsCard article={mockArticle} />);
    const image = screen.getByAltText(mockArticle.title);
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('has proper image async decoding attribute', () => {
    render(<NewsCard article={mockArticle} />);
    const image = screen.getByAltText(mockArticle.title);
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('opens link in new tab', () => {
    render(<NewsCard article={mockArticle} />);
    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies dark mode class when appropriate', () => {
    const { container } = render(<NewsCard article={mockArticle} />);
    const article = container.querySelector('article');
    expect(article).toHaveClass('news-card');
  });
});
