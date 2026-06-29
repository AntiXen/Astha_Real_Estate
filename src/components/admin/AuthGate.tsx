import React, { useState } from 'react';
import { AlertCircle, Sparkles, Check, Globe } from 'lucide-react';
import { signInAdmin, signUpAdmin, getAdminUsers } from '../../services/auth';

interface AuthGateProps {
  userEmail: string;
  isSuperAdminCreated: boolean;
  registeredAdminsCount: number;
  onLoginSuccess: (name: string, email: string) => void;
  onAdminsUpdated: (admins: {name: string, email: string, isSuper?: boolean}[]) => void;
}

export default function AuthGate({ 
  userEmail, 
  isSuperAdminCreated, 
  registeredAdminsCount, 
  onLoginSuccess, 
  onAdminsUpdated 
}: AuthGateProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login States
  const [authEmail, setAuthEmail] = useState<string>(userEmail || '');
  const [authPassword, setAuthPassword] = useState<string>('');
  
  // Signup States
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');

  // Messaging States
  const [authError, setAuthError] = useState<string>('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>('');

  const showSignupOption = !isSuperAdminCreated || registeredAdminsCount === 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!authEmail.trim() || !authPassword) {
      setAuthError('দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই ইংরেজিতে পূরণ করুন!');
      return;
    }

    const res = await signInAdmin(authEmail.trim().toLowerCase(), authPassword);
    if (res?.error) {
      // NOW SHOWING THE REAL ERROR FROM SUPABASE:
      const errorMsg = res.error.message || 'অজানা ত্রুটি ঘটেছে।';
      setAuthError(`লগইন ব্যর্থ হয়েছে: ${errorMsg}`);
      return;
    }
    if (res.user) {
      const admins = await getAdminUsers();
      onAdminsUpdated(admins.map(a => ({ name: a.name, email: a.email, isSuper: a.isSuper })));
      onLoginSuccess(res.user.name, res.user.email);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (isSuperAdminCreated) {
      setAuthError('দুঃখিত, সুপার অ্যাডমিন অ্যাকাউন্ট ইতিমধ্যে তৈরি করা হয়েছে। আপনি সরাসরি নতুন আইডি দিয়ে সাইন আপ করতে পারবেন না।');
      return;
    }

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setAuthError('দয়া করে সবগুলো তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    const res = await signUpAdmin(signupName.trim(), signupEmail.trim().toLowerCase(), signupPassword);
    if (res?.error) {
      const errorMessage = res.error.message || 'অজানা ত্রুটি ঘটেছে।';
      setAuthError(`রেজিস্ট্রেশন ব্যর্থ হয়েছে: ${errorMessage}`);
      return;
    }

    const admins = await getAdminUsers();
    onAdminsUpdated(admins.map(a => ({ name: a.name, email: a.email, isSuper: a.isSuper })));

    if (res.user) {
      setAuthEmail(res.user.email);
      setAuthPassword('');
      setAuthSuccessMsg('অভিনন্দন! আপনার অ্যাডমিন অ্যাকাউন্ট তৈরি হয়ে গেছে।');
      onLoginSuccess(res.user.name, res.user.email);
      return;
    }
    setAuthSuccessMsg('অভিনন্দন! আপনার সুপার অ্যাডমিন অ্যাকাউন্ট রেজিস্টার হয়েছে। এবার লগইন করুন।');
    setAuthMode('login');
  };

  return (
    <div className="mx-auto max-w-md my-16 px-4 font-bengali" id="auth-gate-wrapper">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center mb-3">
            <img 
              src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
              alt="Astha Real Estate Logo"
              className="h-20 w-auto object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-bold text-[#0B2545]">আস্থা অ্যাডমিন প্যানেল</h2>
          <p className="text-xs text-slate-500 mt-1">প্রকল্পসমূহ ও সাইট সেটিংস পরিবর্তন করার সুরক্ষিত স্থান।</p>
        </div>

        {showSignupOption && (
          <div className="flex border border-slate-200 rounded-xl overflow-hidden p-1 bg-slate-50 mb-5 text-center text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
              className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              লগইন অ্যাকাউন্ট
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
              className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signup' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              সাইন আপ (নতুন প্রশাসক)
            </button>
          </div>
        )}

        {authSuccessMsg && (
          <div className="flex items-start space-x-1.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4 font-sans">
            <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        {authError && (
          <div className="flex items-start space-x-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100 mb-4 font-sans">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">প্রশাসক ইমেইল:</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">পাসওয়ার্ড:</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#0B2545] text-white hover:bg-[#0c1f38] py-3 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>নিরাপদ লগইন</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">পূৰ্ণ নাম (Name):</label>
              <input 
                type="text" 
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">প্রশাসক ইমেইল (Email):</label>
              <input 
                type="email" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">পাসওয়ার্ড (Password):</label>
              <input 
                type="password" 
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#C9A84C] text-[#0B2545] hover:bg-[#b0913c] py-3 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>প্রশাসক হিসেবে সাইন আপ করুন</span>
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => { window.location.hash = ''; }}
          className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-100 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all mt-3 cursor-pointer"
        >
          <Globe className="h-4 w-4 text-slate-500" />
          <span>ওয়েবসাইটে ফিরে যান</span>
        </button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            লগইন সমস্যা? সিস্টেম ক্যাশে মুছে ফেলুন (Reset)
          </button>
        </div>
      </div>
    </div>
  );
}