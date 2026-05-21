import { appParams } from '@/lib/app-params';

// Mock base44 client to prevent automatic API calls
export const base44 = {
  get: async () => ({}),
  post: async () => ({}),
  put: async () => ({}),
  delete: async () => ({}),
  query: async () => ({}),
  entities: {
    User: {
      me: async () => ({})
    }
  }
};
