import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_MONTH_NAMES } from '../constants';
import { CollegeLogo } from './CollegeLogo';
import { ChevronLeft, ChevronRight, LogOut, Plus, SlidersHorizontal, Crown } from 'lucide-react';

interface HeaderProps {
  currentYear: number;
  currentMonth: number; // 0 - 11
  onChangeMonth: (delta: number) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  currentMonth,
  onChangeMonth,
  onOpenAddModal,
  onOpenBudgetModal,
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const thaiYear = currentYear + 543;
  const monthName = THAI_MONTH_NAMES[currentMonth] || '';

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-[#0f1115]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Month Switcher */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <CollegeLogo size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-amber-300 tracking-wide uppercase">
                    ระบบจัดการรายรับรายจ่าย
                  </span>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[11px] text-neutral-300 block leading-none font-medium">
                  วิทยาลัยอาชีวศึกษาแพร่
                </span>
              </div>
            </div>

            {/* Modern Month Navigator Pill */}
            <div className="flex items-center bg-[#181a20] rounded-xl p-1 border border-amber-500/25 shadow-inner">
              <button
                id="btn-prev-month"
                type="button"
                onClick={() => onChangeMonth(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-200 hover:bg-neutral-800/80 transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-center min-w-[130px]">
                <span className="text-xs font-semibold text-neutral-100 block">
                  {monthName} <span className="text-amber-400">{thaiYear}</span>
                </span>
              </div>
              <button
                id="btn-next-month"
                type="button"
                onClick={() => onChangeMonth(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-200 hover:bg-neutral-800/80 transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3">
            <button
              id="btn-open-budget-modal"
              type="button"
              onClick={onOpenBudgetModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
              title="ตั้งค่างบประมาณรายเดือน"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>งบประมาณ</span>
            </button>

            <button
              id="btn-open-add-transaction"
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 rounded-xl transition-all shadow-md shadow-amber-500/25 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-neutral-950 stroke-[3]" />
              <span>เพิ่มรายการ</span>
            </button>

            <div className="h-6 w-px bg-neutral-800 mx-1 hidden sm:block" />

            {/* User Profile info */}
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-amber-500/40 object-cover ring-1 ring-amber-500/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/40">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-neutral-200 block truncate max-w-[120px] leading-tight">
                  {userProfile?.displayName || currentUser?.displayName || 'ผู้ใช้งาน'}
                </span>
                <span className="text-[10px] text-amber-400/80 block truncate max-w-[120px] leading-none font-mono">
                  {currentUser?.email}
                </span>
              </div>

              <button
                id="btn-sign-out"
                type="button"
                onClick={logout}
                className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/80 rounded-xl transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
