import React from 'react';
import { 
  LayoutDashboard, Home, Building2, FolderOpen, 
  Mail, Users, Settings, LogOut 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentAdminName: string;
  isSubAdmin: boolean;
  onLogout: () => void;
  onResetDatabase: () => void;
  stats: {
    properties: number;
    companies: number;
    categories: number;
    inquiries: number;
    subAdmins: number;
  };
}

const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const toBn = (num: number | string) => num.toString().split('').map(d => bnDigits[parseInt(d)] || d).join('');

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  currentAdminName,
  isSubAdmin,
  onLogout,
  onResetDatabase,
  stats
}: AdminSidebarProps) {
  return (
    <div className="w-full lg:w-[220px] bg-[#0B2545] flex-shrink-0 flex flex-col font-sans" id="db-sidebar">
      {/* Sidebar Header / Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <img 
            src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
            alt="Astha Real Estate Logo"
            className="h-8 w-auto object-contain bg-white/10 p-1 rounded"
            referrerPolicy="no-referrer"
          />
          <div className="text-left leading-tight">
            <div className="text-[#C9A84C] text-[13px] font-bold tracking-wide truncate max-w-[120px]">আস্থা রিয়েল এস্টেট</div>
            <div className="text-white/35 text-[8px] tracking-wider uppercase mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 text-slate-300 space-y-1 select-none overflow-y-auto">
        <div className="px-4 py-2 text-white/30 text-[9px] uppercase tracking-wider font-bold">মেইন</div>
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>ড্যাশবোর্ড</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
            activeTab === 'properties' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>প্রপার্টি ({toBn(stats.properties)})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
            activeTab === 'companies' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>কোম্পানি ({toBn(stats.companies)})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
            activeTab === 'categories' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>প্রজেক্ট টাইপ ({toBn(stats.categories)})</span>
        </button>

        <div className="px-4 py-2 pt-3 text-white/30 text-[9px] uppercase tracking-wider font-bold">লিড</div>
        
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all border-l-2 cursor-pointer ${
            activeTab === 'inquiries' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4" />
            <span>ইনকোয়ারি</span>
          </div>
          {stats.inquiries > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full mr-1">
              {toBn(stats.inquiries)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subadmins')}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
            activeTab === 'subadmins' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>সাব-অ্যাডমিন্স ({toBn(stats.subAdmins)})</span>
        </button>

        <div className="px-4 py-2 pt-3 text-white/30 text-[9px] uppercase tracking-wider font-bold font-sans">সাইট</div>
        
        {!isSubAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' : 'border-l-transparent text-white/55 hover:bg-white/5'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>সেটিংস</span>
          </button>
        )}

        <div className="pt-2 px-2 pb-4">
          <button
            onClick={onResetDatabase}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-white/5 text-[9px] text-white/40 hover:text-white/80 hover:bg-white/10 transition-all font-sans cursor-pointer"
          >
            রি-ফরম্যাট করুন
          </button>
        </div>
      </div>

      {/* Sidebar Footer / Profile Info */}
      <div className="p-3 border-t border-white/5 bg-black/10 flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-7 w-7 rounded-full bg-[#C9A84C] text-[#0B2545] font-bold text-xs flex items-center justify-center shadow-md shrink-0">
            {currentAdminName.trim().charAt(0) || 'A'}
          </div>
          <div className="text-left leading-none overflow-hidden">
            <div className="text-white/90 text-xs font-semibold truncate pr-1 max-w-[100px]">{currentAdminName}</div>
            <div className="text-[7.5px] font-bold text-[#C9A84C] mt-1.5 uppercase tracking-wide">
              {isSubAdmin ? 'Sub-Admin 🔒' : 'Super Admin 👑'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
          title="লগআউট"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}