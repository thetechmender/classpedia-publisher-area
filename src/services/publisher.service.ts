// File: src/services/publisher.service.ts
import api from './api';
import { ApiResponse, PersonalInfo, AuthInfo, PaymentInfo, TaxInfo } from './credential.service';

export interface CreateAccountPayload {
  publisherId: number;
  createAccount: {
    publisherFullName: string;
    publisherEmail: string;
    publisherPhone: string;
    publisherPassword: string;
    publisherConfirmPassword: string;
  };
  personalInfo: PersonalInfo;
  authInfo: AuthInfo;
  paymentInfo: PaymentInfo;
  taxInfo: TaxInfo;
}

export interface CreateAccountResponse {
  publisherId: number;
  isProfileCompleted: boolean;
}

export const PublisherService = {
  createAccount: async (payload: Partial<CreateAccountPayload>): Promise<ApiResponse<CreateAccountResponse>> => {
    const response = await api.post<ApiResponse<CreateAccountResponse>>('/publisher/create-account', payload);
    return response.data;
  },
};
