import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../constants';
import { X, Check, Target, Sparkles } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateMonthlyBudget } = useAuth();
  const [budget, setBudget] = useState<string>('15000');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.monthlyBudget !== undefined) {
      setBudget(userProfile.monthlyBudget.toString());
    }
  }, [userProfile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budget);
    if (isNaN(num) || num < 0) {
      setErrorMsg('กรุณากรอกงบประมาณที่ถูกต้อง');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await updateMonthlyBudget(num);
      onClose();
    } catch (err: any) {
      console.error('Failed to update budget:', err);
      setErrorMsg('ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="budget-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="budget-modal-content"
        className="bg-[#141720] rounded-2xl border border-amber-500/30 shadow-2xl shadow-black max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171a24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-100">
              ตั้งค่างบประมาณรายเดือน
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed">
            กำหนดเพดานรายจ่ายที่คุณต้องการควบคุมในแต่ละเดือน ระบบจะคำนวณสัดส่วนการใช้จ่ายและแจ้งเตือนเมื่อใกล้เต็มงบ
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
              งบประมาณรายเดือน (บาท)
            </label>
            <div className="relative rounded-xl border border-neutral-700 bg-[#1a1d26] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 overflow-hidden">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400 font-bold text-base">
                ฿
              </span>
              <input
                id="input-monthly-budget"
                type="number"
                step="100"
                min="0"
                placeholder="15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 text-xl font-mono font-bold text-neutral-100 placeholder:text-neutral-600 bg-transparent outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[10000, 15000, 20000, 30000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBudget(preset.toString())}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btn-save-budget"
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
