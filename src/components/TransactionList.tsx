import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import {
  ALL_CATEGORIES,
  formatCurrency,
  formatThaiDate,
} from '../constants';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Edit2,
  ListOrdered,
  Tag,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  year: number;
  month: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  year,
  month,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchNote = (tx.note || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchNote) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [dateStr: string]: Transaction[] } = {};

    filteredTransactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((date) => {
      const items = groups[date];
      const dayIncome = items
        .filter((i) => i.type === 'income')
        .reduce((sum, i) => sum + i.amount, 0);
      const dayExpense = items
        .filter((i) => i.type === 'expense')
        .reduce((sum, i) => sum + i.amount, 0);

      return {
        date,
        items,
        dayIncome,
        dayExpense,
        dayNet: dayIncome - dayExpense,
      };
    });
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'ชื่อรายการ', 'จำนวนเงิน (บาท)', 'หมายเหตุ'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      tx.category,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement-${year}-${String(month + 1).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (catName: string) => {
    const found = ALL_CATEGORIES.find((c) => c.name === catName);
    return found ? found.color : '#fbbf24';
  };

  const getCategoryIcon = (catName: string) => {
    const found = ALL_CATEGORIES.find((c) => c.name === catName);
    return found ? found.iconName : 'HelpCircle';
  };

  return (
    <div
      id="transaction-list-card"
      className="bg-[#12141b] rounded-2xl border border-amber-500/20 shadow-xl shadow-black/40 p-5 sm:p-6"
    >
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 tracking-tight">
              รายการบันทึกทั้งหมด ({filteredTransactions.length} รายการ)
            </h2>
            <p className="text-xs text-neutral-400">
              แถวแสดงผลรายรับ-รายจ่ายเรียงตามวันเวลา
            </p>
          </div>
        </div>

        {/* CSV Export Button in Gold Style */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          title="ดาวน์โหลดไฟล์ CSV"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>ส่งออกไฟล์ CSV</span>
        </button>
      </div>

      {/* Modern Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-transactions-input"
            type="text"
            placeholder="ค้นหาชื่อรายการ, หมวดหมู่, หมายเหตุ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 bg-[#181a22] border border-neutral-800 focus:border-amber-500/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center bg-[#181a20] rounded-xl p-1 border border-amber-500/20 shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Category Dropdown Filter */}
        <div className="relative shrink-0">
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 text-xs text-neutral-200 bg-[#181a22] border border-neutral-800 focus:border-amber-500/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-[#181a22] text-neutral-200">
                {cat.name} ({cat.type === 'expense' ? 'จ่าย' : 'รับ'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Horizontal Row Records Grouped by Date */}
      {groupedTransactions.length === 0 ? (
        <div className="py-12 text-center text-neutral-500">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-300">ไม่พบรายการที่ค้นหา</p>
          <p className="text-xs text-neutral-500 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มรายการ" เพื่อบันทึกข้อมูล
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div
              key={group.date}
              className="border border-neutral-800/90 rounded-2xl overflow-hidden bg-[#151820]/60 shadow-md"
            >
              {/* Date Group Header Row */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#1a1d26] border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatThaiDate(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-400 font-semibold">
                      +{formatCurrency(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-400 font-semibold">
                      -{formatCurrency(group.dayExpense)}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      group.dayNet >= 0
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    สุทธิ: {formatCurrency(group.dayNet)}
                  </span>
                </div>
              </div>

              {/* Transaction Rows */}
              <div className="divide-y divide-neutral-800/80">
                {group.items.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const catColor = getCategoryColor(tx.category);
                  const iconName = getCategoryIcon(tx.category);

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-[#1f232e]/70 transition-all cursor-pointer group"
                    >
                      {/* Left Side: Icon, Title, Category Badge, Note */}
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-neutral-700/60 shadow-xs group-hover:scale-105 transition-transform"
                          style={{
                            backgroundColor: `${catColor}20`,
                            color: catColor,
                            borderColor: `${catColor}40`,
                          }}
                        >
                          <CategoryIcon iconName={iconName} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-100 truncate block group-hover:text-amber-300 transition-colors">
                              {tx.title}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 border"
                              style={{
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                                borderColor: `${catColor}30`,
                              }}
                            >
                              <Tag className="w-2.5 h-2.5 inline mr-1" />
                              {tx.category}
                            </span>
                          </div>

                          {tx.note && (
                            <p className="text-xs text-neutral-400 truncate mt-0.5 font-light">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Amount & Edit Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div
                            className={`text-base font-bold font-mono tracking-tight ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                            {isIncome ? 'รายรับ' : 'รายจ่าย'}
                          </span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-amber-400 hover:text-amber-300 hover:bg-neutral-800 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
