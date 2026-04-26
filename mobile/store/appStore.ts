import { create } from 'zustand';
import api from '../services/api';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  userId: string;
  amount: number;
  period: string;
  month: number;
  year: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: string;
  targetDate?: string;
  icon: string;
  color: string;
  progressPercent: number;
}

interface AppState {
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  categories: { id: string; name: string; icon: string; color: string; isDefault: boolean }[];

  fetchAccounts: () => Promise<void>;
  fetchBudgets: (month?: number, year?: number) => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchCategories: () => Promise<void>;

  addGoal: (payload: Partial<Goal>) => Promise<Goal>;
  updateGoal: (id: string, payload: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addBudget: (payload: Partial<Budget>) => Promise<void>;
  updateBudget: (id: string, payload: { amount: number }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  checkBudgetAlerts: () => Promise<Budget[]>;
}

export const useAppStore = create<AppState>((set) => ({
  accounts: [],
  budgets: [],
  goals: [],
  categories: [],

  fetchAccounts: async () => {
    const { data } = await api.get<Account[]>('/api/accounts');
    set({ accounts: data });
  },

  fetchBudgets: async (month, year) => {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const { data } = await api.get<Budget[]>('/api/budgets', { params });
    set({ budgets: data });
  },

  fetchGoals: async () => {
    const { data } = await api.get<Goal[]>('/api/goals');
    set({ goals: data });
  },

  fetchCategories: async () => {
    const { data } = await api.get('/api/categories');
    set({ categories: data });
  },

  addGoal: async (payload) => {
    const { data } = await api.post<Goal>('/api/goals', payload);
    set((state) => ({ goals: [...state.goals, data] }));
    return data;
  },

  updateGoal: async (id, payload) => {
    const { data } = await api.put<Goal>(`/api/goals/${id}`, payload);
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? data : g)) }));
  },

  deleteGoal: async (id) => {
    await api.delete(`/api/goals/${id}`);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  addBudget: async (payload) => {
    const { data } = await api.post<Budget>('/api/budgets', payload);
    set((state) => ({ budgets: [...state.budgets, data] }));
  },

  updateBudget: async (id, payload) => {
    const { data } = await api.put<Budget>(`/api/budgets/${id}`, payload);
    set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? data : b)) }));
  },

  deleteBudget: async (id) => {
    await api.delete(`/api/budgets/${id}`);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },

  checkBudgetAlerts: async () => {
    const { data } = await api.get<Budget[]>('/api/budgets/alerts');
    return data;
  },
}));
