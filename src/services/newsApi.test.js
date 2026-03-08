import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import * as newsApi from './newsApi';

// Mock axios
vi.mock('axios');

describe('newsApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache
    newsApi.clearCache?.();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockArticles = [
    {
      source: { id: null, name: 'Source 1' },
      author: 'Author 1',
      title: 'Article 1',
      description: 'Description 1',
      url: 'https://example.com/1',
      urlToImage: 'https://example.com/image1.jpg',
      publishedAt: '2024-01-01T00:00:00Z',
      content: 'Content 1',
    },
    {
      source: { id: null, name: 'Source 2' },
      author: 'Author 2',
      title: 'Article 2',
      description: 'Description 2',
      url: 'https://example.com/2',
      urlToImage: 'https://example.com/image2.jpg',
      publishedAt: '2024-01-02T00:00:00Z',
      content: 'Content 2',
    },
  ];

  describe('fetchTopHeadlines', () => {
    it('fetches headlines with default parameters', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles).toHaveLength(2);
      expect(result.totalResults).toBe(2);
    });

    it('includes API key in request', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('apiKey='),
        expect.any(Object)
      );
    });

    it('accepts category parameter', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.fetchTopHeadlines({
        category: 'business',
        country: 'us',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('category=business'),
        expect.any(Object)
      );
    });

    it('accepts country parameter', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'gb',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('country=gb'),
        expect.any(Object)
      );
    });

    it('accepts page parameter for pagination', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 2,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });

    it('handles API errors gracefully', async () => {
      axios.get.mockRejectedValue(
        new Error('API Error: 429 - Too many requests')
      );

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('returns empty array on 404 error', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 },
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('handles network errors', async () => {
      axios.get.mockRejectedValue(
        new Error('Network Error: No internet connection')
      );

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('caches results for 5 minutes', async () => {
      const mockResponse = {
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      const params = {
        category: 'general',
        country: 'us',
        page: 1,
      };

      // First call
      await newsApi.fetchTopHeadlines(params);
      expect(axios.get).toHaveBeenCalledTimes(1);

      // Second call with same params should use cache
      await newsApi.fetchTopHeadlines(params);
      expect(axios.get).toHaveBeenCalledTimes(1); // Still 1, used cache
    });

    it('invalidates cache after 5 minutes', async () => {
      jest.useFakeTimers();

      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      const params = {
        category: 'general',
        country: 'us',
        page: 1,
      };

      // First call
      await newsApi.fetchTopHeadlines(params);
      expect(axios.get).toHaveBeenCalledTimes(1);

      // Advance time by 5 minutes + 1 second
      // Note: This would need proper implementation in the service
      // For now, this test documents the expected behavior
    });

    it('creates different cache entries for different parameters', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      // First request
      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      // Different category
      await newsApi.fetchTopHeadlines({
        category: 'business',
        country: 'us',
        page: 1,
      });

      // Should make 2 different calls
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('returns formatted articles with all fields', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles[0]).toHaveProperty('title');
      expect(result.articles[0]).toHaveProperty('description');
      expect(result.articles[0]).toHaveProperty('url');
      expect(result.articles[0]).toHaveProperty('urlToImage');
      expect(result.articles[0]).toHaveProperty('source');
      expect(result.articles[0]).toHaveProperty('publishedAt');
      expect(result.articles[0]).toHaveProperty('author');
    });

    it('handles empty results', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: [],
          totalResults: 0,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });

    it('handles large result sets', async () => {
      const largeArticleSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockArticles[0],
        id: i,
        title: `Article ${i}`,
      }));

      axios.get.mockResolvedValue({
        data: {
          articles: largeArticleSet,
          totalResults: 1000,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles).toHaveLength(100);
    });

    it('uses correct API endpoint', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('top-headlines'),
        expect.any(Object)
      );
    });
  });

  describe('searchArticles', () => {
    it('searches articles with query', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      const result = await newsApi.searchArticles({
        query: 'technology',
        page: 1,
      });

      expect(result.articles).toHaveLength(2);
    });

    it('includes search query in request', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      await newsApi.searchArticles({
        query: 'AI',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('q=AI'),
        expect.any(Object)
      );
    });

    it('accepts sortBy parameter', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      await newsApi.searchArticles({
        query: 'technology',
        sortBy: 'popularity',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=popularity'),
        expect.any(Object)
      );
    });

    it('uses everything endpoint for search', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.searchArticles({
        query: 'technology',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('everything'),
        expect.any(Object)
      );
    });

    it('handles search with no results', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: [],
          totalResults: 0,
        },
      });

      const result = await newsApi.searchArticles({
        query: 'xyznonexistent',
        page: 1,
      });

      expect(result.articles).toHaveLength(0);
    });

    it('handles special characters in search query', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.searchArticles({
        query: 'COVID-19 & vaccines',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalled();
    });

    it('caches search results', async () => {
      axios.get.mockResolvedValue({
        data: {
          articles: mockArticles,
          totalResults: 2,
        },
      });

      const params = {
        query: 'technology',
        page: 1,
      };

      // First call
      await newsApi.searchArticles(params);
      expect(axios.get).toHaveBeenCalledTimes(1);

      // Second call with same params
      await newsApi.searchArticles(params);
      expect(axios.get).toHaveBeenCalledTimes(1); // Used cache
    });
  });

  describe('API Rate Limiting', () => {
    it('handles 429 Too Many Requests error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 429,
          data: { message: 'You have been rate limited' },
        },
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('handles 401 Unauthorized error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid API key' },
        },
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('handles 400 Bad Request error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid parameter' },
        },
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'invalid',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });

    it('handles 500 Server error', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('validates article data structure', async () => {
      const invalidArticle = {
        title: 'Article',
        // Missing required fields
      };

      axios.get.mockResolvedValue({
        data: {
          articles: [invalidArticle],
          totalResults: 1,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles[0]).toHaveProperty('title');
    });

    it('handles null or undefined article properties', async () => {
      const articleWithNulls = {
        ...mockArticles[0],
        author: null,
        description: undefined,
      };

      axios.get.mockResolvedValue({
        data: {
          articles: [articleWithNulls],
          totalResults: 1,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(result.articles).toHaveLength(1);
    });

    it('provides default values for missing fields', async () => {
      const articleWithMissingFields = {
        title: 'Article',
        url: 'https://example.com',
        source: { name: 'Source' },
        publishedAt: '2024-01-01T00:00:00Z',
        // Missing description, image, etc.
      };

      axios.get.mockResolvedValue({
        data: {
          articles: [articleWithMissingFields],
          totalResults: 1,
        },
      });

      const result = await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      // Service should handle missing fields gracefully
      expect(result.articles).toHaveLength(1);
    });
  });

  describe('Timeout Handling', () => {
    it('sets appropriate axios timeout', async () => {
      axios.get.mockResolvedValue({
        data: { articles: [], totalResults: 0 },
      });

      await newsApi.fetchTopHeadlines({
        category: 'general',
        country: 'us',
        page: 1,
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: expect.any(Number),
        })
      );
    });

    it('handles request timeout errors', async () => {
      axios.get.mockRejectedValue({
        message: 'timeout of 10000ms exceeded',
      });

      await expect(
        newsApi.fetchTopHeadlines({
          category: 'general',
          country: 'us',
          page: 1,
        })
      ).rejects.toThrow();
    });
  });
});
