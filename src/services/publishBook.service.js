// File: src/services/publishBook.service.js
// API service for the multi-step publish flow.
import api from './api';

/**
 * Extract a friendly error message from an axios error.
 */
const getApiError = (err, fallback = 'Something went wrong') => {
  if (err?.response?.data) {
    const d = err.response.data;
    return d.errorMessage || d.message || d.error || fallback;
  }
  return err?.message || fallback;
};

export const PublishBookService = {
  /** Step 1 — Book details. Returns { bookId, ... } */
  step1: async (payload) => {
    console.log('PublishBookService.step1 called with:', payload);
    const res = await api.post('/publisher-book/publish-book-step1', payload);
    console.log('PublishBookService.step1 response:', res.data);
    return res.data;
  },

  /** Content chapter batch (loops in 3-chapter chunks). */
  publishBookContent: async (payload) => {
    console.log('PublishBookService.publishBookContent called with chapters:', payload.manuscriptStructure?.chapters?.length);
    const res = await api.post('/publisher-book/publish-book-content', payload);
    console.log('PublishBookService.publishBookContent response:', res.data);
    return res.data;
  },

  /** Step 2 — Cover + DRM + AI + ISBN. */
  step2: async (payload) => {
    console.log('PublishBookService.step2 called with:', payload);
    const res = await api.post('/publisher-book/publish-book-step2', payload);
    console.log('PublishBookService.step2 response:', res.data);
    return res.data;
  },

  /** Step 3 — Pricing. */
  step3: async (payload) => {
    console.log('PublishBookService.step3 called with:', payload);
    const res = await api.post('/publisher-book/publish-book-step3', payload);
    console.log('PublishBookService.step3 response:', res.data);
    return res.data;
  },

  /** Step 4 — Submit for review. */
  step4: async (payload) => {
    console.log('PublishBookService.step4 called with:', payload);
    const res = await api.post('/publisher-book/publish-book-step4', payload);
    console.log('PublishBookService.step4 response:', res.data);
    return res.data;
  },

  /** List books with pagination + filters. */
  list: async ({ pageNumber = 1, pageSize = 20, searchTerm = '', status = '', sortBy = '' } = {}) => {
    const params = { pageNumber, pageSize };
    if (searchTerm) params.searchTerm = searchTerm;
    if (status && status !== 'all') params.status = status;
    if (sortBy) params.sortBy = sortBy;
    const res = await api.get('/publisher-book/list', { params });
    return res.data;
  },

  /** Get a single book's full details. */
  details: async (bookId) => {
    const res = await api.get(`/publisher-book/details/${bookId}`);
    return res.data;
  },
};

export { getApiError };
