// File: src/services/generalSettings.service.ts
import api from './api';

export interface Country {
  id: number;
  name: string;
  isO2: string;
  isO3: string;
  phoneCode: string;
  emoji: string;
}

export interface Category {
  id: number;
  title: string;
}

export interface Language {
  id: number;
  title: string;
}

export interface ContributorRole {
  id: number;
  title: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const generalSettingsService = {
  getCountries: async (): Promise<Country[]> => {
    const response = await api.get<ApiResponse<Country[]>>('/Meta/countries');
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/Meta/book-categories');
    return response.data.data;
  },

  getLanguages: async (): Promise<Language[]> => {
    const response = await api.get<ApiResponse<Language[]>>('/Meta/languages');
    return response.data.data;
  },

  getContributorRoles: async (): Promise<ContributorRole[]> => {
    const response = await api.get<ApiResponse<ContributorRole[]>>('/Meta/contributor-roles');
    return response.data.data;
  },
};

export default generalSettingsService;
