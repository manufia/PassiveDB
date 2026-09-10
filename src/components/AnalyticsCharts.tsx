import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatCurrency } from '../constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  year: number;
  month: number; // 0 - 11
}

// Harmonious Black & Gold luxury palette
const LUXURY_GOLD_COLORS = [
  '#f59e0b', // Amber Gold
  '#fbbf24', // Warm Gold
  '#d97706', // Deep Gold / Bronze
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#38bdf8', // Ice Blue
  '#c084fc', // Royal Purple
  '#fb923c', // Warm Copper
  '#2dd4bf', // Teal
  '#e2e8f0', // Platinum
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ transactions, year, month }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'daily'>('category');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  // Filter transactions by type for category chart
  const categoryData = useMemo(() => {
    const filtered = transactions.filter((t) => t.type === categoryType);
    const categoryTotals: Record<string, number> = {};

    filtered.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const totalSum = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalSum > 0 ? (value / totalSum) * 100 : 0,
        color: LUXURY_GOLD_COLORS[index % LUXURY_GOLD_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categoryType]);

  // Daily trend data
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const fullDate = `${year}-${monthStr}-${dayStr}`;
      return {
        day: `${dayNum}`,
        date: fullDate,
        income: 0,
        expense: 0,
      };
    });

    transactions.forEach((t) => {
      const dayMatch = t.date.match(/-(\d{2})$/);
      if (dayMatch) {
        const dayIdx = parseInt(dayMatch[1], 10) - 1;
        if (dayIdx >= 0 && dayIdx < daysInMonth) {
          if (t.type === 'income') {
            daysArray[dayIdx].income += t.amount;
          } else {
            daysArray[dayIdx].expense += t.amount;
          }
        }
      }
    });

    return daysArray;
  }, [transactions, year, month]);

  const hasTransactions = transactions.length > 0;

  return (
    <div
      id="analytics-charts-card"
      className="bg-[#12141b] rounded-2xl border border-amber-500/20 shadow-xl shadow-black/40 p-5 sm:p-6"
    >
      {/* Modern Header Row with Gold Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-2">
              <span>กราฟวิเคราะห์ข้อมูลการเงิน</span>
            </h2>
            <p className="text-xs text-neutral-400">
              สัดส่วนหมวดหมู่และแนวโน้มการหมุนเวียนเงินในเดือนนี้
            </p>
          </div>
        </div>

        {/* View Switcher Tabs in Gold Obsidian Pill */}
        <div className="flex items-center bg-[#181a20] rounded-xl p-1 border border-amber-500/25 self-start sm:self-auto shadow-inner">
          <button
            id="tab-category-breakdown"
            type="button"
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'category'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>หมวดหมู่</span>
          </button>
          <button
            id="tab-daily-trend"
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>แนวโน้มรายวัน</span>
          </button>
        </div>
      </div>

      {!hasTransactions ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-inner">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">ยังไม่มีรายการในเดือนนี้</p>
          <p className="text-xs text-neutral-400 mt-1">
            กดปุ่ม "เพิ่มรายการ" ด้านบน เพื่อเริ่มบันทึกรายรับหรือรายจ่าย
          </p>
        </div>
      ) : activeTab === 'category' ? (
        <div>
          {/* Sub-toggle Row: Expense vs Income */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryType('expense')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryType === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>รายจ่าย ({transactions.filter((t) => t.type === 'expense').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('income')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>รายรับ ({transactions.filter((t) => t.type === 'income').length})</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-amber-400 font-mono hidden sm:inline">
              ยอดรวม {formatCurrency(categoryData.reduce((s, c) => s + c.value, 0))}
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              ไม่มีรายการประเภท{categoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Pie / Donut Chart with dark stroke */}
              <div className="lg:col-span-6 h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={98}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#12141b"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'จำนวน']}
                      contentStyle={{
                        backgroundColor: '#181a22',
                        borderRadius: '12px',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                        fontSize: '12px',
                        color: '#fef3c7',
                      }}
                      itemStyle={{ color: '#fbbf24' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Table / Horizontal Rows */}
              <div className="lg:col-span-6 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {categoryData.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-2 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-amber-500/30 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-neutral-200">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 font-mono">
                          {formatCurrency(cat.value)}
                        </span>
                        <span className="text-neutral-400 text-[11px] w-12 text-right font-mono">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Gold-accented percentage bar */}
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Daily Trend Bar Chart in Black & Gold */
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
            <span>เปรียบเทียบกระแสเงินสดรายวัน (รายรับ vs รายจ่าย)</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222632" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#2e3340' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#2e3340' }}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    formatCurrency(val),
                    name === 'income' ? 'รายรับ' : 'รายจ่าย',
                  ]}
                  labelFormatter={(label) => `วันที่ ${label}`}
                  contentStyle={{
                    backgroundColor: '#181a22',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                    fontSize: '12px',
                    color: '#fef3c7',
                  }}
                />
                <Legend
                  formatter={(val) => (
                    <span className="text-neutral-300 text-xs font-medium">
                      {val === 'income' ? 'รายรับ (Income)' : 'รายจ่าย (Expense)'}
                    </span>
                  )}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                {/* Gold Income and Rose Expense bars */}
                <Bar dataKey="income" name="income" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
