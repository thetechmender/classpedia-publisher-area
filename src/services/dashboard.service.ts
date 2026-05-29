// File: src/services/dashboard.service.ts
import api from './api';

export interface DashboardSummary {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  inReviewBooks: number;
  rejectedBooks: number;
  lifetimeEarnings: number;
  pendingPayout: number;
  totalUnitsSold: number;
  openIssues: number;
  totalReviews: number;
}

export interface MonthlyData {
  month: string;
  units: number;
  revenue: number;
  royalties: number;
}

export interface EarningsStats {
  lifetimeEarnings: number;
  pendingPayout: number;
  totalPaidOut: number;
  totalUnitsSold: number;
  nextPayoutDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
}

export interface BookSale {
  bookId: number;
  bookTitle: string;
  unitsSold: number;
  revenue: number;
  royalties: number;
}

export interface AuthorProfile {
  payment_method: string;
  paypal_email: string;
  us_person: boolean;
  tax_country: string;
  tax_id_type: string;
  tax_id: string;
  esignature: string;
}

export interface EarningsData {
  monthlyData: MonthlyData[];
  stats: EarningsStats;
  transactions: Transaction[];
  bookSales: BookSale[];
  authorProfile: AuthorProfile;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  errorMessage: string;
  statusCode: number;
}

export const DashboardService = {
  getDashboardSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/publisher-dashboard/dashboard-summary');
    return response.data;
  },

  getEarnings: async (): Promise<ApiResponse<EarningsData>> => {
    const response = await api.get<ApiResponse<EarningsData>>('/publisher-dashboard/earnings');
    return response.data;
  },
};
