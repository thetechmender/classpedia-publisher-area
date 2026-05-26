// File: src/services/credential.service.ts
import api from './api';

// Login Types
export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponseData {
  publisherId: number;
  token: string;
  tokenExpirationTime: string;
  publisherFullName: string;
  publisherEmail: string;
  publisherPhone: string;
  profileImageUrl: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  errorMessage: string;
  statusCode: number;
}

// Account Types
export interface PersonalInfo {
  legalFirstName: string;
  legalLastName: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AuthInfo {
  bio: string;
  preferredCategories: string[];
  website: string;
  twitterHandle: string;
  instagramHandle: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export interface PaymentInfo {
  paymentMethod: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  paypalEmail: string;
}

export interface TaxInfo {
  usPerson: boolean;
  taxIdType: string;
  taxId: string;
  taxCountry: string;
  esignConsent: boolean;
  esignature: string;
  taxCertified: boolean;
}

export interface AccountData {
  publisherId: number;
  publisherFullName: string;
  publisherEmail: string;
  publisherPhone: string;
  isProfileCompleted: boolean;
  personalInfo: PersonalInfo | null;
  authInfo: AuthInfo | null;
  paymentInfo: PaymentInfo | null;
  taxInfo: TaxInfo | null;
}

export const CredentialService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    const response = await api.post<ApiResponse<LoginResponseData>>('/publisher/auth/login', payload);
    return response.data;
  },

  getAccount: async (): Promise<ApiResponse<AccountData>> => {
    const response = await api.get<ApiResponse<AccountData>>('/publisher/get-account');
    return response.data;
  },
};
