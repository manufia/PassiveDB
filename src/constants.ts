import { CategoryInfo } from './types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', iconName: 'Utensils', color: '#f97316' },
  { id: 'transport', name: 'การเดินทางและยานพาหนะ', type: 'expense', iconName: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', iconName: 'ShoppingBag', color: '#ec4899' },
  { id: 'housing', name: 'ที่อยู่อาศัยและค่าน้ำค่าไฟ', type: 'expense', iconName: 'Home', color: '#8b5cf6' },
  { id: 'bills', name: 'ค่าโทรศัพท์และอินเทอร์เน็ต', type: 'expense', iconName: 'Smartphone', color: '#06b6d4' },
  { id: 'entertainment', name: 'ความบันเทิงและท่องเที่ยว', type: 'expense', iconName: 'Film', color: '#eab308' },
  { id: 'health', name: 'สุขภาพและยารักษาโรค', type: 'expense', iconName: 'HeartPulse', color: '#ef4444' },
  { id: 'education', name: 'การศึกษาและหนังสือ', type: 'expense', iconName: 'BookOpen', color: '#10b981' },
  { id: 'family', name: 'ครอบครัวและสัตว์เลี้ยง', type: 'expense', iconName: 'Users', color: '#f59e0b' },
  { id: 'other_exp', name: 'รายจ่ายอื่นๆ', type: 'expense', iconName: 'MoreHorizontal', color: '#64748b' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', iconName: 'Briefcase', color: '#10b981' },
  { id: 'bonus', name: 'โบนัสและเงินพิเศษ', type: 'income', iconName: 'Award', color: '#059669' },
  { id: 'freelance', name: 'ธุรกิจส่วนตัว / งานเสริม', type: 'income', iconName: 'Laptop', color: '#0d9488' },
  { id: 'investment', name: 'ดอกเบี้ย / เงินปันผล / ลงทุน', type: 'income', iconName: 'TrendingUp', color: '#2563eb' },
  { id: 'gift', name: 'ของขวัญ / ได้รับเงินช่วยเหลือ', type: 'income', iconName: 'Gift', color: '#8b5cf6' },
  { id: 'other_inc', name: 'รายรับอื่นๆ', type: 'income', iconName: 'PlusCircle', color: '#64748b' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('THB', '฿');
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10) + 543; // Buddhist Era
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${THAI_MONTH_NAMES[monthIdx] || ''} ${year}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
