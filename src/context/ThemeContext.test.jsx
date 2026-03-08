/**
 * ThemeContext Tests
 * Tests for theme provider and context functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Test component that uses the theme context
const TestComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-value">{isDark ? 'dark' : 'light'}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides theme context to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toBeInTheDocument();
  });

  it('starts with light theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('toggles theme when toggleTheme is called', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    const themeValue = screen.getByTestId('theme-value');
    
    expect(themeValue).toHaveTextContent('light');
    
    await user.click(button);
    
    expect(themeValue).toHaveTextContent('dark');
  });

  it('toggles theme multiple times', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    const themeValue = screen.getByTestId('theme-value');
    
    // Toggle to dark
    await user.click(button);
    expect(themeValue).toHaveTextContent('dark');
    
    // Toggle back to light
    await user.click(button);
    expect(themeValue).toHaveTextContent('light');
    
    // Toggle to dark again
    await user.click(button);
    expect(themeValue).toHaveTextContent('dark');
  });

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    await user.click(button);
    
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Create a spy on console.error to suppress error output
    const originalError = console.error;
    console.error = () => {};
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow();
    
    console.error = originalError;
  });

  it('applies theme to document class', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    
    // Toggle to dark
    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light
    await user.click(button);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
