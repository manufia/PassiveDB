export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  note?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  monthlyBudget?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
}

export interface MonthlySummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  monthlyBudget: number;
  budgetRemaining: number;
  budgetUsagePercent: number;
}
