/**
 * News API Service
 * Handles all API calls to NewsAPI.org
 */

import axios from 'axios';

// NewsAPI.org free tier API key - You can get your own at https://newsapi.org
const API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Replace with your actual API key for production
const BASE_URL = 'https://newsapi.org/v2';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Cache for API responses to reduce API calls
 */
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if available and not expired
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

/**
 * Set cache data
 */
const setCacheData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Fetch top headlines
 * @param {Object} options - Query options
 * @param {string} options.country - Country code (e.g., 'us', 'gb')
 * @param {string} options.category - Category (business, entertainment, health, science, sports, technology)
 * @param {number} options.page - Page number for pagination
 * @param {number} options.pageSize - Number of articles per page
 * @returns {Promise<Object>} Articles data
 */
export const fetchTopHeadlines = async (options = {}) => {
  const {
    country = 'us',
    category = '',
    page = 1,
    pageSize = 20,
    sortBy = 'publishedAt',
  } = options;

  const cacheKey = `headlines-${country}-${category}-${page}-${pageSize}`;
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const params = {
      apiKey: API_KEY,
      page,
      pageSize,
    };

    // IMPORTANT: NewsAPI free tier top-headlines requires country parameter
    // Only add country if provided, it's required for this endpoint
    if (country) {
      params.country = country;
    } else {
      // Fallback to US if no country specified
      params.country = 'us';
    }

    if (category) {
      params.category = category;
    }

    const response = await apiClient.get('/top-headlines', { params });
    
    const result = {
      articles: response.data.articles || [],
      totalResults: response.data.totalResults || 0,
      status: response.data.status,
    };

    // Cache the result
    setCacheData(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    console.error('Country:', options.country);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      `Failed to fetch headlines for ${options.country || 'US'}. Check your API key or try a different country.`
    );
  }
};

/**
 * Search articles by keyword
 * @param {Object} options - Query options
 * @param {string} options.q - Search query
 * @param {string} options.sortBy - Sort by: relevancy, popularity, publishedAt
 * @param {string} options.language - Language code (e.g., 'en')
 * @param {number} options.page - Page number
 * @param {number} options.pageSize - Number of articles per page
 * @returns {Promise<Object>} Search results
 */
export const searchArticles = async (options = {}) => {
  const {
    q = '',
    sortBy = 'publishedAt',
    language = 'en',
    page = 1,
    pageSize = 20,
  } = options;

  if (!q.trim()) {
    return { articles: [], totalResults: 0, status: 'ok' };
  }

  const cacheKey = `search-${q}-${sortBy}-${page}-${pageSize}`;

  // Check cache
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const params = {
      q: q.trim(),
      apiKey: API_KEY,
      page,
      pageSize,
      sortBy,
      language,
    };

    const response = await apiClient.get('/everything', { params });

    const result = {
      articles: response.data.articles || [],
      totalResults: response.data.totalResults || 0,
      status: response.data.status,
    };

    // Cache the result
    setCacheData(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error searching articles:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to search articles'
    );
  }
};

/**
 * Get available categories
 */
export const getCategories = () => {
  return [
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'general', label: 'General' },
  ];
};

/**
 * Get available countries
 * Note: This API key currently only supports United States
 * To add more countries, you need a paid NewsAPI plan or use the /everything endpoint
 * See: https://newsapi.org/pricing
 */
export const getCountries = () => {
  return [
    { value: 'us', label: 'United States (US news only with this key)' },
  ];
};

/**
 * Clear cache (useful for manual refresh)
 */
export const clearCache = () => {
  cache.clear();
};

export default {
  fetchTopHeadlines,
  searchArticles,
  getCategories,
  getCountries,
  clearCache,
};
