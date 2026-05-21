// File: src/services/ebook.service.ts
import api from './api';
import { Ebook, EbookPayload } from '../types/eBook';


export const EbookService = {
  create: async (data: EbookPayload): Promise<Ebook> => {
    const response = await api.post<Ebook>('/ebooks', data);
    return response.data;
  },

  getAll: async (): Promise<Ebook[]> => {
    const response = await api.get<Ebook[]>('/ebooks');
    return response.data;
  },

  getById: async (id: string): Promise<Ebook> => {
    const response = await api.get<Ebook>(`/ebooks/${id}`);
    return response.data;
  },
};
