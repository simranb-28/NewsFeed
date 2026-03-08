/**
 * Header Component
 * Navigation and controls (search, filters, dark mode toggle)
 * Optimized with React.memo and useCallback
 * 
 * @component
 * @example
 * const [search, setSearch] = useState('');
 * const [category, setCategory] = useState('');
 * const [country, setCountry] = useState('us');
 * 
 * return (
 *   <Header
 *     onSearchChange={setSearch}
 *     onCategoryChange={setCategory}
 *     onCountryChange={setCountry}
 *     searchValue={search}
 *     categoryValue={category}
 *     countryValue={country}
 *   />
 * )
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearchChange - Callback when search input changes
 * @param {Function} props.onCategoryChange - Callback when category filter changes
 * @param {Function} props.onCountryChange - Callback when country filter changes
 * @param {string} props.searchValue - Current search query value
 * @param {string} props.categoryValue - Currently selected category
 * @param {string} props.countryValue - Currently selected country code
 * 
 * @returns {React.ReactElement} Header with search, filters, and theme toggle
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getCategories, getCountries } from '../services/newsApi';
import './Header.css';

const Header = ({
  onSearchChange,
  onCategoryChange,
  onCountryChange,
  searchValue,
  categoryValue,
  countryValue,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [searchInput, setSearchInput] = useState(searchValue || '');
  
  // Memoize categories and countries to prevent recreation on every render
  const categories = useMemo(() => getCategories(), []);
  const countries = useMemo(() => getCountries(), []);

  /**
   * Handle search input change with debouncing
   */
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);
      onSearchChange(value);
    },
    [onSearchChange]
  );

  /**
   * Clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    onSearchChange('');
  }, [onSearchChange]);

  /**
   * Memoize category change handler
   */
  const handleCategoryChange = useCallback(
    (e) => onCategoryChange(e.target.value),
    [onCategoryChange]
  );

  /**
   * Memoize country change handler
   */
  const handleCountryChange = useCallback(
    (e) => onCountryChange(e.target.value),
    [onCountryChange]
  );

  /**
   * Memoize theme toggle handler
   */
  const handleThemeToggle = useCallback(toggleTheme, [toggleTheme]);

  return (
    <header className={`header ${isDark ? 'dark' : 'light'}`}>
      <div className="header-container">
        {/* Logo & Title */}
        <div className="header-logo">
          <span className="logo-icon">📰</span>
          <h1>NewsHub</h1>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <input
            type="text"
            placeholder="Search news..."
            value={searchInput}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchInput && (
            <button
              className="search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
          <span className="search-icon">🔍</span>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* Category Filter */}
          <select
            value={categoryValue || ''}
            onChange={handleCategoryChange}
            className="filter-select"
            title="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={countryValue || 'us'}
            onChange={handleCountryChange}
            className="filter-select"
            title="Select country"
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>

          {/* Dark Mode Toggle */}
          <button
            className="theme-toggle"
            onClick={handleThemeToggle}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
