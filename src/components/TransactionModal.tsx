import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getTodayDateString,
} from '../constants';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, Trash2, Coins } from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { currentUser } = useAuth();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setTitle(transactionToEdit.title);
      setNote(transactionToEdit.note || '');
      setDate(transactionToEdit.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setTitle('');
      setNote('');
      setDate(getTodayDateString());
    }
    setErrorMsg(null);
  }, [transactionToEdit, isOpen]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const catList = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setCategory(catList[0].name);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('กรุณาระบุชื่อรายการ');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setErrorMsg('กรุณาเลือกวันที่ที่ถูกต้อง');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const nowIso = new Date().toISOString();

    try {
      if (transactionToEdit) {
        const docPath = `transactions/${transactionToEdit.id}`;
        const txRef = doc(db, 'transactions', transactionToEdit.id);
        const updatedPayload = {
          id: transactionToEdit.id,
          userId: currentUser.uid,
          type,
          amount: numAmount,
          category,
          title: title.trim(),
          note: note.trim(),
          date,
          createdAt: transactionToEdit.createdAt,
          updatedAt: nowIso,
        };
        try {
          await updateDoc(txRef, updatedPayload);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, docPath);
        }
      } else {
        const newId = 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        const docPath = `transactions/${newId}`;
        const txRef = doc(db, 'transactions', newId);
        const newPayload: Transaction = {
          id: newId,
          userId: currentUser.uid,
          type,
          amount: numAmount,
          category,
          title: title.trim(),
          note: note.trim(),
          date,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        try {
          await setDoc(txRef, newPayload);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, docPath);
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setErrorMsg(err.message || 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToEdit || !currentUser) return;
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;

    setSaving(true);
    const docPath = `transactions/${transactionToEdit.id}`;
    try {
      const txRef = doc(db, 'transactions', transactionToEdit.id);
      await deleteDoc(txRef);
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="transaction-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="transaction-modal-content"
        className="bg-[#141720] rounded-2xl border border-amber-500/30 shadow-2xl shadow-black max-w-lg w-full overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#171a24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-100">
              {transactionToEdit ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Type Toggle: Expense vs Income in Dark Gold Style */}
          <div className="grid grid-cols-2 gap-2 bg-[#1b1f2b] p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              รายจ่าย (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              รายรับ (+)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative rounded-xl border border-neutral-700 bg-[#1a1d26] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 overflow-hidden">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400 font-bold text-base">
                ฿
              </span>
              <input
                id="input-transaction-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 text-xl font-mono font-bold text-neutral-100 placeholder:text-neutral-600 bg-transparent outline-none"
                autoFocus={!transactionToEdit}
              />
            </div>

            {/* Quick Add Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 mr-1">ปุ่มลัด:</span>
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/20 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 border border-neutral-800 rounded-xl bg-[#171a24]">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/50 shadow-xs'
                        : 'text-neutral-400 hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
              ชื่อรายการ / รายละเอียด *
            </label>
            <input
              id="input-transaction-title"
              type="text"
              maxLength={120}
              placeholder="เช่น อาหารกลางวัน, ค่าน้ำมัน, ช้อปปิ้ง, เงินเดือน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 bg-[#1a1d26] border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Date & Note Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <input
                id="input-transaction-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm text-neutral-100 bg-[#1a1d26] border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                หมายเหตุ (ถ้ามี)
              </label>
              <input
                id="input-transaction-note"
                type="text"
                maxLength={300}
                placeholder="รายละเอียดเพิ่มเติม"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 bg-[#1a1d26] border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            {transactionToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบรายการ</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                id="btn-save-transaction"
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                <span>{saving ? 'กำลังบันทึก...' : transactionToEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
