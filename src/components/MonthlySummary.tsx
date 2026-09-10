import React from 'react';
import { MonthlySummaryData } from '../types';
import { formatCurrency } from '../constants';
import { ArrowDownLeft, ArrowUpRight, Wallet, Target, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface MonthlySummaryProps {
  summary: MonthlySummaryData;
  onOpenBudgetModal: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary, onOpenBudgetModal }) => {
  const isOverBudget = summary.monthlyBudget > 0 && summary.totalExpense > summary.monthlyBudget;
  const isNearBudget =
    summary.monthlyBudget > 0 &&
    !isOverBudget &&
    summary.budgetUsagePercent >= 80;

  return (
    <div id="monthly-summary-container" className="space-y-4">
      {/* Modern Horizontal Row Grid for Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row Card 1: Total Income */}
        <div className="bg-[#12141b] rounded-2xl border border-amber-500/20 hover:border-amber-500/40 p-5 shadow-lg shadow-black/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              รายรับทั้งหมด
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            +{formatCurrency(summary.totalIncome)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
            <span>เดือนนี้</span>
            <span className="text-emerald-400/90 font-medium">เข้าบัญชี</span>
          </div>
        </div>

        {/* Row Card 2: Total Expense */}
        <div className="bg-[#12141b] rounded-2xl border border-amber-500/20 hover:border-amber-500/40 p-5 shadow-lg shadow-black/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              รายจ่ายทั้งหมด
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 tracking-tight">
            -{formatCurrency(summary.totalExpense)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
            <span>เดือนนี้</span>
            <span className="text-rose-400/90 font-medium">{summary.transactionCount} รายการ</span>
          </div>
        </div>

        {/* Row Card 3: Net Balance (Gold Highlighting) */}
        <div className="bg-gradient-to-br from-[#171a22] to-[#12141b] rounded-2xl border-2 border-amber-500/40 hover:border-amber-400/70 p-5 shadow-xl shadow-amber-500/5 transition-all group relative overflow-hidden">
          {/* Subtle Golden Glow Corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              คงเหลือสุทธิ
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div
            className={`text-2xl font-black tracking-tight ${
              summary.netBalance >= 0
                ? 'text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
                : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary.netBalance)}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] border-t border-amber-500/20 pt-2">
            {summary.netBalance >= 0 ? (
              <span className="text-amber-400/90 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                สถานะการเงินบวก
              </span>
            ) : (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                รายจ่ายเกินรายรับ
              </span>
            )}
            <span className="text-[10px] text-amber-400/70 font-mono">สุทธิ</span>
          </div>
        </div>

        {/* Row Card 4: Monthly Budget Progress */}
        <div className="bg-[#12141b] rounded-2xl border border-amber-500/20 hover:border-amber-500/40 p-5 shadow-lg shadow-black/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                งบประมาณ
              </span>
              <button
                type="button"
                onClick={onOpenBudgetModal}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                แก้ไข
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-bold text-neutral-100">
                {formatCurrency(summary.monthlyBudget)}
              </span>
              <span
                className={`text-xs font-bold ${
                  isOverBudget
                    ? 'text-rose-400'
                    : isNearBudget
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {summary.monthlyBudget > 0
                  ? `${summary.budgetUsagePercent.toFixed(0)}%`
                  : 'ไม่ได้ตั้ง'}
              </span>
            </div>

            {/* Gauge Progress bar */}
            <div className="w-full bg-neutral-900 rounded-full h-2 border border-neutral-800 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearBudget
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{ width: `${Math.min(summary.budgetUsagePercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">คงเหลือใช้ได้:</span>
            <span
              className={`font-semibold ${
                summary.budgetRemaining >= 0 ? 'text-amber-300' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.budgetRemaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
