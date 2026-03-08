/**
 * Main App Component
 * Orchestrates the entire application
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');

  return (
    <ThemeProvider>
      <div className="app">
        <Header
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onCountryChange={setSelectedCountry}
          searchValue={searchQuery}
          categoryValue={selectedCategory}
          countryValue={selectedCountry}
        />

        <main className="app-main">
          <NewsFeed
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedCountry={selectedCountry}
          />
        </main>

        <footer className="app-footer">
          <p>
            © 2024 NewsHub. Built with React + Vite. Data from{' '}
            <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">
              NewsAPI.org
            </a>
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
