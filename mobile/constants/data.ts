export const DEFAULT_CATEGORIES = [
  { id: 'default-food', name: 'Food', icon: 'restaurant', color: '#E07A5F' },
  { id: 'default-travel', name: 'Travel', icon: 'airplane', color: '#3D405B' },
  { id: 'default-rent', name: 'Rent', icon: 'home', color: '#81B29A' },
  { id: 'default-utilities', name: 'Utilities', icon: 'flash', color: '#F2CC8F' },
  { id: 'default-shopping', name: 'Shopping', icon: 'bag', color: '#6B4226' },
  { id: 'default-dining-and-food', name: 'Dining & Food', icon: 'restaurant-outline', color: '#2D6A4F' },
  { id: 'default-transport', name: 'Transport', icon: 'car', color: '#457B9D' },
  { id: 'default-health', name: 'Health', icon: 'medical', color: '#E63946' },
  { id: 'default-entertainment', name: 'Entertainment', icon: 'musical-notes', color: '#A8DADC' },
  { id: 'default-salary', name: 'Salary', icon: 'cash', color: '#52B788' },
  { id: 'default-freelance', name: 'Freelance', icon: 'laptop', color: '#74C69D' },
  { id: 'default-investment', name: 'Investment', icon: 'trending-up', color: '#1B4332' },
  { id: 'default-others', name: 'Others', icon: 'ellipsis-horizontal', color: '#ADB5BD' },
];

// Quick-add categories shown on Add Transaction screen (matches wireframe)
export const QUICK_CATEGORIES = [
  { id: 'default-food', name: 'Food', icon: 'restaurant' },
  { id: 'default-travel', name: 'Travel', icon: 'airplane' },
  { id: 'default-rent', name: 'Rent', icon: 'home' },
  { id: 'default-utilities', name: 'Utilities', icon: 'flash' },
];

export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
