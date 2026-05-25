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
  },
  integrations: {
    Core: {
      // Mock file upload: returns a local blob URL for demo purposes
      UploadFile: async ({ file }) => {
        // Simulate small network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const file_url = URL.createObjectURL(file);
        return { file_url };
      }
    }
  }
};
