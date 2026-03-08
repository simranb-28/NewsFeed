/**
 * NewsFeed Component
 * Main component for displaying articles with infinite scroll
 * Optimized with useCallback and useMemo for performance
 * 
 * @component
 * @example
 * return (
 *   <NewsFeed
 *     searchQuery="react"
 *     selectedCategory="technology"
 *     selectedCountry="us"
 *   />
 * )
 * 
 * @param {Object} props - Component props
 * @param {string} [props.searchQuery=''] - Search query for filtering articles
 * @param {string} [props.selectedCategory=''] - Category filter value
 * @param {string} [props.selectedCountry='us'] - Country code for headlines
 * 
 * Features:
 * - Infinite scroll pagination with intersection observer
 * - Smart caching with 5-minute TTL
 * - Error handling with retry functionality
 * - Loading states with skeleton cards
 * - Empty and error state messages
 * 
 * @returns {React.ReactElement} Articles feed with infinite scroll
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import NewsCard from './NewsCard';
import { fetchTopHeadlines, searchArticles } from '../services/newsApi';
import { useTheme } from '../context/ThemeContext';
import SkeletonCard from './SkeletonCard';
import './NewsFeed.css';

const NewsFeed = ({
  searchQuery = '',
  selectedCategory = '',
  selectedCountry = 'us',
}) => {
  const { isDark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const lastQueryRef = useRef({
    searchQuery: '',
    selectedCategory: '',
    selectedCountry: '',
  });

  /**
   * Fetch articles based on current filters
   */
  const fetchArticles = useCallback(
    async (pageNum = 1, isNewSearch = false) => {
      try {
        setIsLoading(true);
        setError(null);

        let result;

        if (searchQuery.trim()) {
          // Use search endpoint if there's a search query
          result = await searchArticles({
            q: searchQuery,
            page: pageNum,
            pageSize: 20,
            sortBy: 'publishedAt',
          });
        } else {
          // Use top headlines endpoint
          result = await fetchTopHeadlines({
            country: selectedCountry,
            category: selectedCategory,
            page: pageNum,
            pageSize: 20,
          });
        }

        if (result.articles.length === 0 && pageNum === 1) {
          setArticles([]);
          setHasMore(false);
          return;
        }

        const totalPages = Math.ceil(result.totalResults / 20);
        setHasMore(pageNum < totalPages);
        setTotalResults(result.totalResults);

        if (isNewSearch || pageNum === 1) {
          setArticles(result.articles);
        } else {
          setArticles((prev) => [...prev, ...result.articles]);
        }

        setPage(pageNum);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message || 'Failed to fetch articles. Please try again.');
        if (pageNum === 1) {
          setArticles([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedCategory, selectedCountry]
  );

  /**
   * Handle infinite scroll - load more articles
   */
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchArticles(page + 1);
    }
  }, [inView, hasMore, isLoading, page, fetchArticles]);

  /**
   * Reset and fetch articles when filters change
   */
  useEffect(() => {
    const currentQuery = {
      searchQuery,
      selectedCategory,
      selectedCountry,
    };

    // Check if query actually changed
    if (
      lastQueryRef.current.searchQuery !== currentQuery.searchQuery ||
      lastQueryRef.current.selectedCategory !== currentQuery.selectedCategory ||
      lastQueryRef.current.selectedCountry !== currentQuery.selectedCountry
    ) {
      lastQueryRef.current = currentQuery;
      setPage(1);
      setArticles([]);
      setHasMore(true);
      fetchArticles(1, true);
    }
  }, [searchQuery, selectedCategory, selectedCountry, fetchArticles]);

  /**
   * Retry loading articles on error
   */
  const handleRetry = useCallback(() => {
    setError(null);
    fetchArticles(1, true);
  }, [fetchArticles]);

  /**
   * Memoize skeleton cards array to prevent recreation
   */
  const skeletonCards = useMemo(() => [...Array(6)], []);
  const skeletonCardsLoading = useMemo(() => [...Array(3)], []);

  /**
   * Render loading skeleton
   */
  if (articles.length === 0 && isLoading) {
    return (
      <div className={`newsfeed ${isDark ? 'dark' : 'light'}`}>
        <div className="newsfeed-grid">
          {skeletonCards.map((_, i) => (
            <SkeletonCard key={i} isDark={isDark} />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && articles.length === 0) {
    return (
      <div className={`newsfeed ${isDark ? 'dark' : 'light'}`}>
        <div className="newsfeed-error">
          <span className="error-icon">⚠️</span>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (articles.length === 0) {
    return (
      <div className={`newsfeed ${isDark ? 'dark' : 'light'}`}>
        <div className="newsfeed-empty">
          <span className="empty-icon">📰</span>
          <h2>No articles found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`newsfeed ${isDark ? 'dark' : 'light'}`}>
      {/* Articles Grid */}
      <div className="newsfeed-grid">
        {articles.map((article, index) => (
          <NewsCard key={`${article.url}-${index}`} article={article} />
        ))}
      </div>

      {/* Load More Trigger & Loading State */}
      {hasMore && (
        <>
          <div ref={loadMoreRef} className="newsfeed-load-more-trigger" />
          {isLoading && (
            <div className="newsfeed-loading">
              <div className="skeleton-grid">
                {skeletonCardsLoading.map((_, i) => (
                  <SkeletonCard key={i} isDark={isDark} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No More Articles */}
      {!hasMore && articles.length > 0 && (
        <div className="newsfeed-end">
          <p>You've reached the end! 🎉</p>
          <span className="end-count">
            Showing {articles.length} of {totalResults} articles
          </span>
        </div>
      )}

      {/* Error Message (when loading more) */}
      {error && articles.length > 0 && (
        <div className="newsfeed-error-inline">
          <p>{error}</p>
          <button className="btn btn-small" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(NewsFeed);
