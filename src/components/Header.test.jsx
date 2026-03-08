/**
 * Header Component Tests
 * Tests for search, filters, and theme toggle
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

// Mock the theme context
vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
  }),
}));

describe('Header Component', () => {
  const mockProps = {
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onCountryChange: vi.fn(),
    searchValue: '',
    categoryValue: '',
    countryValue: 'us',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with logo', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('NewsHub')).toBeInTheDocument();
    expect(screen.getByText('📰')).toBeInTheDocument();
  });

  it('renders search input field', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByPlaceholderText('Search news...')).toBeInTheDocument();
  });

  it('renders category filter select', () => {
    render(<Header {...mockProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2); // At least category and country
  });

  it('renders country filter select', () => {
    render(<Header {...mockProps} />);
    const countrySelect = screen.getByDisplayValue('United States');
    expect(countrySelect).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search news...');
    await user.type(searchInput, 'React');
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('React');
  });

  it('renders clear search button when search has value', () => {
    render(<Header {...mockProps} searchValue="test" />);
    expect(screen.getByTitle('Clear search')).toBeInTheDocument();
  });

  it('does not render clear button when search is empty', () => {
    render(<Header {...mockProps} searchValue="" />);
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument();
  });

  it('calls onSearchChange with empty string when clear button clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} searchValue="test" />);
    
    const clearButton = screen.getByTitle('Clear search');
    await user.click(clearButton);
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onCategoryChange when category select changes', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    await user.selectOptions(categorySelect, 'technology');
    
    expect(mockProps.onCategoryChange).toHaveBeenCalledWith('technology');
  });

  it('calls onCountryChange when country select changes', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    
    const countrySelect = screen.getByDisplayValue('United States');
    await user.selectOptions(countrySelect, 'gb');
    
    expect(mockProps.onCountryChange).toHaveBeenCalledWith('gb');
  });

  it('renders theme toggle button', () => {
    render(<Header {...mockProps} />);
    const themeButton = screen.getByRole('button', { name: /light mode|dark mode/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('displays moon icon for light theme', () => {
    render(<Header {...mockProps} />);
    const themeButton = screen.getByTitle(/dark mode/i);
    expect(themeButton).toHaveTextContent('🌙');
  });

  it('shows all category options', () => {
    render(<Header {...mockProps} />);
    const categorySelect = screen.getByDisplayValue('All Categories');
    
    const categories = [
      'Business',
      'Entertainment',
      'Health',
      'Science',
      'Sports',
      'Technology',
      'General',
    ];
    
    categories.forEach(cat => {
      expect(screen.getByText(cat)).toBeInTheDocument();
    });
  });

  it('shows all country options', () => {
    render(<Header {...mockProps} />);
    const countries = [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'India',
      'Germany',
      'France',
      'Japan',
      'Brazil',
      'Russia',
    ];
    
    countries.forEach(country => {
      expect(screen.getByText(country)).toBeInTheDocument();
    });
  });

  it('has search icon', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('applies correct CSS class for light theme', () => {
    const { container } = render(<Header {...mockProps} />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('light');
  });
});
