import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { MonthlySummary } from './components/MonthlySummary';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { Transaction, MonthlySummaryData } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { RotateCcw, Plus, Loader2 } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  // Date State: Current selected Year & Month
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0 - 11

  // Transactions State
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Firestore Realtime Listener for Current User's Transactions
  useEffect(() => {
    if (!currentUser) {
      setAllTransactions([]);
      setLoadingTx(false);
      return;
    }

    setLoadingTx(true);
    const path = 'transactions';
    const q = query(
      collection(db, path),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Transaction);
        });
        // Sort descending by date, then createdAt
        list.sort((a, b) => {
          const dateDiff = b.date.localeCompare(a.date);
          if (dateDiff !== 0) return dateDiff;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        setAllTransactions(list);
        setLoadingTx(false);
      },
      (error) => {
        setLoadingTx(false);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Filter transactions for the selected month & year
  const targetPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => {
    return allTransactions.filter((tx) => tx.date.startsWith(targetPrefix));
  }, [allTransactions, targetPrefix]);

  // Calculate Monthly Summary
  const monthlySummary: MonthlySummaryData = useMemo(() => {
    const totalIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const monthlyBudget = userProfile?.monthlyBudget || 0;
    const budgetRemaining = monthlyBudget - totalExpense;
    const budgetUsagePercent = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      transactionCount: monthTransactions.length,
      monthlyBudget,
      budgetRemaining,
      budgetUsagePercent,
    };
  }, [monthTransactions, userProfile]);

  const handleChangeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  const isCurrentMonthSelected =
    selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs text-neutral-400">กำลังเชื่อมต่อกับ Firebase...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-neutral-100 pb-20 relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Row */}
      <Header
        currentYear={selectedYear}
        currentMonth={selectedMonth}
        onChangeMonth={handleChangeMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      {/* Main Dashboard Rows */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Month Navigation Banner (Row Alert) */}
        {!isCurrentMonthSelected && (
          <div className="flex items-center justify-between bg-[#151820] border border-amber-500/30 px-5 py-3 rounded-2xl text-xs text-amber-300 shadow-md">
            <span>กำลังดูข้อมูลย้อนหลัง / อนาคต</span>
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-200 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>กลับสู่เดือนปัจจุบัน</span>
            </button>
          </div>
        )}

        {/* Row 1: Key Financial Metric Row Cards */}
        <MonthlySummary
          summary={monthlySummary}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Row 2: Analytics & Visual Charts Row */}
        <AnalyticsCharts
          transactions={monthTransactions}
          year={selectedYear}
          month={selectedMonth}
        />

        {/* Row 3: Transaction List Rows */}
        {loadingTx ? (
          <div className="bg-[#12141b] rounded-2xl border border-neutral-800 p-12 text-center shadow-lg">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-400">กำลังโหลดรายการจาก Firebase...</p>
          </div>
        ) : (
          <TransactionList
            transactions={monthTransactions}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            year={selectedYear}
            month={selectedMonth}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      {/* Floating Add Button for Mobile (Gold Accent) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          id="btn-mobile-floating-add"
          type="button"
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
          title="เพิ่มรายการใหม่"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
