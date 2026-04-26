import { create } from 'zustand';

type Period = 'weekly' | 'monthly' | 'yearly';

export interface ReportSummary {
  period: Period;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  efficiencyScore: number;
  savingsChangePercent: number;
}

export interface TrendPoint {
  label: string;
  amount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  category: { id: string; name: string; icon: string; color: string } | null;
  amount: number;
  percentOfTotal: number;
}

interface ReportState {
  summary: ReportSummary | null;
  trend: TrendPoint[];
  categoryBreakdown: CategoryBreakdown[];
  selectedPeriod: Period;
  isLoading: boolean;

  setPeriod: (period: Period) => void;
  fetchAll: (period: Period) => Promise<void>;
}

import api from '../services/api';

export const useReportStore = create<ReportState>((set, get) => ({
  summary: null,
  trend: [],
  categoryBreakdown: [],
  selectedPeriod: 'monthly',
  isLoading: false,

  setPeriod: (period) => {
    set({ selectedPeriod: period });
    get().fetchAll(period);
  },

  fetchAll: async (period) => {
    set({ isLoading: true });
    try {
      const [summaryRes, trendRes, catRes] = await Promise.all([
        api.get(`/api/reports/summary?period=${period}`),
        api.get(`/api/reports/trend?period=${period}`),
        api.get(`/api/reports/categories?period=${period}`),
      ]);
      set({
        summary: summaryRes.data,
        trend: trendRes.data.data,
        categoryBreakdown: catRes.data.data,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
