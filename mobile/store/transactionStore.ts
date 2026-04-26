import { create } from 'zustand';
import api from '../services/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string | null;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  currency: string;
  categoryId: string;
  accountId: string;
  userId: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
  category: Category;
  account: { id: string; name: string };
}

export interface TransactionPage {
  total: number;
  page: number;
  limit: number;
  data: Transaction[];
}

interface TransactionState {
  transactions: Transaction[];
  total: number;
  isLoading: boolean;
  fetchTransactions: (params?: Record<string, string | number>) => Promise<void>;
  addTransaction: (payload: Partial<Transaction> & { type: string; amount: number; categoryId: string; accountId: string }) => Promise<Transaction>;
  updateTransaction: (id: string, payload: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  total: 0,
  isLoading: false,

  fetchTransactions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<TransactionPage>('/api/transactions', { params });
      set({ transactions: data.data, total: data.total });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (payload) => {
    const { data } = await api.post<Transaction>('/api/transactions', payload);
    set((state) => ({ transactions: [data, ...state.transactions], total: state.total + 1 }));
    return data;
  },

  updateTransaction: async (id, payload) => {
    const { data } = await api.put<Transaction>(`/api/transactions/${id}`, payload);
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? data : t)),
    }));
  },

  deleteTransaction: async (id) => {
    await api.delete(`/api/transactions/${id}`);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      total: state.total - 1,
    }));
  },
}));
