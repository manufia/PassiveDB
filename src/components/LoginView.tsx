import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CollegeLogo } from './CollegeLogo';
import { PieChart, ShieldCheck, ArrowRight, Sparkles, Crown } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setErrorMsg(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google โปรดลองใหม่อีกครั้ง');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      id="login-view-container"
      className="min-h-screen bg-[#0a0c10] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
    >
      {/* Subtle Golden Ambient Backlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#13161e] border border-amber-500/30 shadow-2xl shadow-black/80 rounded-2xl p-8 text-center relative z-10">
        {/* College Logo */}
        <div className="flex justify-center mb-5">
          <CollegeLogo size="xl" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Crown className="w-3.5 h-3.5" />
          <span>วิทยาลัยอาชีวศึกษาแพร่</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-neutral-100 mb-1">
          ระบบจัดการรายรับรายจ่าย
        </h1>
        <p className="text-xs text-neutral-400 mb-7 leading-relaxed">
          บันทึกและวิเคราะห์การเงินรายเดือน จัดเก็บข้อมูลบน Firebase Cloud สะดวก ปลอดภัย
        </p>

        {/* Feature Highlights Row */}
        <div className="space-y-3 text-left mb-8 bg-[#181b24] p-4 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <PieChart className="w-4 h-4" />
            </div>
            <span className="text-xs text-neutral-200 font-medium">สรุปผลรายเดือน & กราฟวิเคราะห์สัดส่วน</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs text-neutral-200 font-medium">จัดเก็บข้อมูลปลอดภัยใน Firebase Cloud</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs text-neutral-200 font-medium">ตั้งงบประมาณและแจ้งเตือนสถานะเงินคงเหลือ</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button in Luxury Style */}
        <button
          id="btn-google-login"
          type="button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#1f232e] to-[#171a22] hover:from-[#262b38] hover:to-[#1d212b] active:bg-neutral-800 text-neutral-100 font-semibold text-sm transition-all shadow-lg shadow-black/60 disabled:opacity-60 cursor-pointer group"
        >
          {signingIn ? (
            <div className="flex items-center gap-2 text-amber-300">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>กำลังเข้าสู่ระบบ...</span>
            </div>
          ) : (
            <>
              {/* Google G SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Gmail)</span>
              <ArrowRight className="w-4 h-4 text-amber-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <p className="mt-6 text-[11px] text-neutral-400">
          เข้าใช้งานอย่างปลอดภัยด้วยระบบ Google Identity Services
        </p>
      </div>
    </div>
  );
};
