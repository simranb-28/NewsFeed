/**
 * SkeletonCard Component
 * Loading skeleton for NewsCard
 * Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Shows an animated skeleton/placeholder while content is loading.
 * Provides better user experience with visual indication of loading state.
 * 
 * @component
 * @example
 * return (
 *   <div>
 *     {isLoading && <SkeletonCard isDark={isDark} />}
 *   </div>
 * )
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isDark - Whether to apply dark theme styling
 * 
 * @returns {React.ReactElement} Animated skeleton placeholder
 */

import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = ({ isDark }) => {
  return (
    <div className={`skeleton-card ${isDark ? 'dark' : 'light'}`}>
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-source"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-title-short"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description-short"></div>
        <div className="skeleton-meta"></div>
        <div className="skeleton-link"></div>
      </div>
    </div>
  );
};

// Memoize to prevent re-renders
export default React.memo(SkeletonCard);
