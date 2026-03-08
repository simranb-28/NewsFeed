/**
 * NewsCard Component
 * Displays an individual news article
 * Optimized with React.memo for preventing unnecessary re-renders
 * 
 * @component
 * @example
 * const article = {
 *   title: "Breaking News",
 *   description: "Article description",
 *   urlToImage: "https://...",
 *   url: "https://...",
 *   source: { name: "News Source" },
 *   publishedAt: "2024-03-08T...",
 *   author: "Author Name"
 * };
 * return <NewsCard article={article} />
 * 
 * @param {Object} props - Component props
 * @param {Object} props.article - Article data object
 * @param {string} props.article.title - Article title
 * @param {string} props.article.description - Article description
 * @param {string} props.article.urlToImage - URL to article image
 * @param {string} props.article.url - URL to full article
 * @param {Object} props.article.source - Article source information
 * @param {string} props.article.source.name - Source name
 * @param {string} props.article.publishedAt - Publication date (ISO 8601)
 * @param {string} [props.article.author] - Article author name (optional)
 * 
 * @returns {React.ReactElement} Rendered article card
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import './NewsCard.css';

const NewsCard = ({ article }) => {
  const { isDark } = useTheme();
  const {
    title,
    description,
    urlToImage,
    url,
    source,
    publishedAt,
    author,
  } = article;

  // Handle image error
  const [imageError, setImageError] = useState(false);

  // Memoize formatDate function to avoid recreation on every render
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }, []);

  // Memoize formatted date to prevent recalculation
  const formattedDate = useMemo(() => formatDate(publishedAt), [publishedAt, formatDate]);

  // Callback for image error handler
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <article className={`news-card ${isDark ? 'dark' : 'light'}`}>
      {/* Image Container */}
      <div className="news-card-image-container">
        {!imageError && urlToImage ? (
          <img
            src={urlToImage}
            alt={title}
            className="news-card-image"
            loading="lazy"
            onError={handleImageError}
            decoding="async"
          />
        ) : (
          <div className="news-card-image-placeholder">
            <span>📰</span>
          </div>
        )}
        <div className="news-card-overlay"></div>
      </div>

      {/* Content Container */}
      <div className="news-card-content">
        {/* Source Badge */}
        <div className="news-card-source">
          {source?.name || 'Unknown Source'}
        </div>

        {/* Title */}
        <h3 className="news-card-title" title={title}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="news-card-description">{description}</p>
        )}

        {/* Meta Information */}
        <div className="news-card-meta">
          <span className="news-card-date">
            {formattedDate}
          </span>
          {author && <span className="news-card-author">by {author}</span>}
        </div>

        {/* Read More Button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card-link"
        >
          Read More →
        </a>
      </div>
    </article>
  );
};

// Memoize component to prevent re-renders when props haven't changed
export default React.memo(NewsCard);
