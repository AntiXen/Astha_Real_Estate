import React, { useState, useEffect } from 'react';
import { LogOut, Save, X, Upload, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { SiteSettings, Category, Company, Property, Inquiry } from '../../types';
import { getCurrentAdmin, initializeLocalAdmins, getAdminUsers, createSubAdmin, deleteAdminUser, signOutAdmin } from '../../services/auth';
import { dbService } from '../../services/db';
import { uploadPropertyImage, uploadPropertyVideo, deleteStorageFileByUrl } from '../../services/storage';

// Import our modular views
import AuthGate from './AuthGate';
import AdminSidebar from './AdminSidebar';
import DashboardView from './views/DashboardView';
import PropertiesView from './views/PropertiesView';
import SettingsView from './views/SettingsView';
import CategoriesView from './views/CategoriesView';
import CompaniesView from './views/CompaniesView';
import InquiriesView from './views/InquiriesView';
import SubAdminsView from './views/SubAdminsView';

interface AdminPanelProps {
  settings: SiteSettings;
  categories: Category[];
  companies: Company[];
  properties: Property[];
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onUpdateCategories: (newCats: Category[]) => void;
  onUpdateCompanies: (newComps: Company[]) => void;
  onUpdateProperties: (newProps: Property[]) => void;
  onResetDatabase: () => void;
  userEmail: string;
}

const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
export const toBn = (num: number | string) => num.toString().split('').map(d => bnDigits[parseInt(d)] || d).join('');

export const formatTime = (isoDate?: string) => {
  if (!isoDate) return 'কিছুক্ষণ আগে';
  const d = new Date(isoDate);
  return d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AdminPanel({
  settings, categories, companies, properties,
  onUpdateSettings, onUpdateCategories, onUpdateCompanies, onUpdateProperties, onResetDatabase, userEmail
}: AdminPanelProps) {
  
  // --- Global Admin State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdminName, setCurrentAdminName] = useState<string>('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('');
  const [registeredAdmins, setRegisteredAdmins] = useState<{name: string, email: string, isSuper?: boolean}[]>([]);
  const [superAdminEmail, setSuperAdminEmail] = useState<string>('');
  const [isSuperAdminCreated, setIsSuperAdminCreated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'companies' | 'categories' | 'inquiries' | 'settings' | 'subadmins'>('dashboard');

  const isSubAdmin = currentAdminEmail.toLowerCase() !== superAdminEmail.toLowerCase() && superAdminEmail !== '';

  // --- Data States ---
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);

  // --- Categories State ---
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatSlug, setNewCatSlug] = useState<string>('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catError, setCatError] = useState<string>('');
  const [catSuccess, setCatSuccess] = useState<string>('');

  // --- Companies State ---
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newCompanyEstablished, setNewCompanyEstablished] = useState<string>('');
  const [newCompanyLogo, setNewCompanyLogo] = useState<string>('🏢');
  const [compError, setCompError] = useState<string>('');
  const [compSuccess, setCompSuccess] = useState<string>('');

  // --- Sub-Admins State ---
  const [subAdminName, setSubAdminName] = useState<string>('');
  const [subAdminEmail, setSubAdminEmail] = useState<string>('');
  const [subAdminPassword, setSubAdminPassword] = useState<string>('');
  const [subAdminError, setSubAdminError] = useState<string>('');
  const [subAdminSuccess, setSubAdminSuccess] = useState<string>('');

  // --- Properties Form State (Modal) ---
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propTitle, setPropTitle] = useState<string>('');
  const [propPrice, setPropPrice] = useState<string>('');
  const [propLocation, setPropLocation] = useState<string>('');
  const [propCategory, setPropCategory] = useState<string>(categories[0]?.id || '');
  const [propCompany, setPropCompany] = useState<string>(companies[0]?.id || '');
  const [propDesc, setPropDesc] = useState<string>('');
  const [propImages, setPropImages] = useState<string[]>([]);
  const [propVideoUrl, setPropVideoUrl] = useState<string>('');
  const [propStatus, setPropStatus] = useState<string>('সক্রিয়');
  const [propSize, setPropSize] = useState<number>(1500);
  const [propBedrooms, setPropBedrooms] = useState<number>(3);
  const [propBathrooms, setPropBathrooms] = useState<number>(3);
  const [propFacing, setPropFacing] = useState<string>('দক্ষিণমুখী');
  const [propFeatured, setPropFeatured] = useState<boolean>(false);

  // --- Uploading States ---
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string>('');

  // --- Initialization & Data Fetching ---
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  useEffect(() => {
    (async () => {
      try { initializeLocalAdmins(); } catch (e) {}

      try {
        const admins = await getAdminUsers();
        setRegisteredAdmins(admins.map(a => ({ name: a.name, email: a.email, isSuper: a.isSuper })));
        const superAdmin = admins.find(a => a.isSuper);
        if (superAdmin) setSuperAdminEmail(superAdmin.email);
        setIsSuperAdminCreated(Boolean(superAdmin));
      } catch (e) {}

      try {
        const current = await getCurrentAdmin();
        if (current) {
          setIsAuthenticated(true);
          setCurrentAdminName(current.name);
          setCurrentAdminEmail(current.email);
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const data = await dbService.getInquiries();
        setInquiries(data);
      }
    })();
  }, [activeTab, isAuthenticated]);

  // --- Action Handlers ---
  const handleLogout = async () => {
    try { await signOutAdmin(); } catch (e) {}
    setIsAuthenticated(false);
    setCurrentAdminEmail('');
    setCurrentAdminName('');
    window.location.hash = '';
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleAddCategory = () => {
    setCatError(''); setCatSuccess('');
    if (!newCatName.trim() || !newCatSlug.trim()) return setCatError('নাম এবং ইউনিক কোড পূরণ করুন!');
    
    const normalizedSlug = newCatSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.slug === normalizedSlug && c.id !== editingCatId)) {
      return setCatError('এই ইউনিক কোডটি ব্যবহৃত হয়েছে!');
    }

    const targetCat: Category = { id: editingCatId || `cat-${Date.now()}`, name: newCatName.trim(), slug: normalizedSlug };
    onUpdateCategories(editingCatId ? categories.map(c => c.id === editingCatId ? targetCat : c) : [...categories, targetCat]);
    
    setCatSuccess(editingCatId ? 'আপডেট হয়েছে!' : 'যোগ করা হয়েছে!');
    setNewCatName(''); setNewCatSlug(''); setEditingCatId(null);
    setTimeout(() => setCatSuccess(''), 4000);
  };

  const handleEditCategory = (cat: Category) => {
    setCatError(''); setCatSuccess('');
    setNewCatName(cat.name); setNewCatSlug(cat.slug); setEditingCatId(cat.id);
  };

  const handleDeleteCategory = (id: string) => {
    if (isSubAdmin) return setCatError('মুছে ফেলার অনুমতি নেই!');
    if (categories.length <= 1) return setCatError('সর্বনিম্ন একটি ক্যাটাগরি থাকতে হবে!');
    
    onUpdateCategories(categories.filter(c => c.id !== id));
    setCatSuccess('ক্যাটাগরি মুছে ফেলা হয়েছে!');
    if (editingCatId === id) { setNewCatName(''); setNewCatSlug(''); setEditingCatId(null); }
    setTimeout(() => setCatSuccess(''), 4000);
  };

  const handleAddCompany = () => {
    setCompError(''); setCompSuccess('');
    if (!newCompanyName.trim()) return setCompError('কোম্পানির নাম পূরণ করুন!');

    const newComp: Company = {
      id: `comp-${Date.now()}`, companyName: newCompanyName.trim(),
      logoUrl: newCompanyLogo || '🏢', established: newCompanyEstablished.trim() || '২০১৫'
    };

    onUpdateCompanies([...companies, newComp]);
    setNewCompanyName(''); setNewCompanyEstablished(''); setNewCompanyLogo('🏢');
    setCompSuccess('কোম্পানি যুক্ত করা হয়েছে!');
    setTimeout(() => setCompSuccess(''), 4500);
  };

  const handleDeleteCompany = (id: string) => {
    if (isSubAdmin) return setCompError('কোম্পানি মুছে ফেলার অনুমতি নেই!');
    if (companies.length <= 1) return setCompError('তালিকায় অন্তত একটি কোম্পানি রাখা আবশ্যক!');
    
    onUpdateCompanies(companies.filter(c => c.id !== id));
    setCompSuccess('কোম্পানি অপসারিত হয়েছে!');
    setTimeout(() => setCompSuccess(''), 4000);
  };

  const openNewPropertyForm = () => {
    setEditingProperty(null);
    setPropTitle(''); setPropPrice(''); setPropLocation(''); setPropDesc('');
    setPropCategory(categories[0]?.id || ''); setPropCompany(companies[0]?.id || '');
    setPropImages([]); setPropVideoUrl(''); setPropStatus('সক্রিয়');
    setPropSize(1800); setPropBedrooms(3); setPropBathrooms(3);
    setPropFacing('দক্ষিণমুখী'); setPropFeatured(false);
    setMediaError('');
    setIsPropertyFormOpen(true);
  };

  const openEditPropertyForm = (p: Property) => {
    setEditingProperty(p);
    setPropTitle(p.title); setPropPrice(p.price); setPropLocation(p.location); setPropDesc(p.description);
    setPropCategory(p.categoryId); setPropCompany(p.companyId);
    setPropImages(p.images || []); setPropVideoUrl(p.videoUrl || ''); setPropStatus(p.status);
    setPropSize(p.size || 2000); setPropBedrooms(p.bedrooms || 3); setPropBathrooms(p.bathrooms || 3);
    setPropFacing(p.facing || 'দক্ষিণমুখী'); setPropFeatured(p.isFeatured);
    setMediaError('');
    setIsPropertyFormOpen(true);
  };

  const handleSaveProperty = () => {
    if (!propTitle || !propPrice || !propLocation) return alert('শিরোনাম, মূল্য এবং লোকেশন প্রদান করুন!');
    
    const defaultImg = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800';
    const finalImages = propImages.length > 0 ? propImages : [defaultImg];

    const savedProp: Property = {
      id: editingProperty?.id || `prop-${Date.now()}`,
      title: propTitle.trim(), description: propDesc.trim() || 'যাচাইকৃত একটি প্রিমিয়াম প্রজেক্ট।',
      price: propPrice.trim(), location: propLocation.trim(),
      categoryId: propCategory, companyId: propCompany,
      images: finalImages,
      videoUrl: propVideoUrl.trim() || undefined, isFeatured: propFeatured, status: propStatus,
      size: propSize, facing: propFacing,
      bedrooms: propCategory === 'cat-2' ? undefined : propBedrooms,
      bathrooms: propCategory === 'cat-2' ? undefined : propBathrooms,
    };

    onUpdateProperties(editingProperty ? properties.map(p => p.id === editingProperty.id ? savedProp : p) : [savedProp, ...properties]);
    setIsPropertyFormOpen(false); setEditingProperty(null);
  };

  const handleDeleteProperty = (id: string) => {
    if (isSubAdmin) return alert('প্রজেক্ট মুছে ফেলার অনুমতি নেই!');
    if (confirm('আপনি কি নিশ্চিতভাবে এই প্রজেক্টটি ডিলিট করতে চান?')) onUpdateProperties(properties.filter(p => p.id !== id));
  };

  const handleAddSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminError(''); setSubAdminSuccess('');
    if (isSubAdmin) return setSubAdminError('শুধুমাত্র সুপার-অ্যাডমিন যুক্ত করতে পারেন!');
    
    const res = await createSubAdmin(subAdminName.trim(), subAdminEmail.trim().toLowerCase(), subAdminPassword.trim());
    if (res?.error) return setSubAdminError('সাব-অ্যাডমিন তৈরি করতে সমস্যা হয়েছে।');

    setRegisteredAdmins((await getAdminUsers()).map(a => ({ name: a.name, email: a.email, isSuper: a.isSuper })));
    setSubAdminSuccess(`নতুন সাব-অ্যাডমিন যুক্ত হয়েছে!`);
    setSubAdminName(''); setSubAdminEmail(''); setSubAdminPassword('');
    setTimeout(() => setSubAdminSuccess(''), 5000);
  };

  const handleDeleteSubAdmin = async (email: string) => {
    if (isSubAdmin) return alert('ডিলিট করার অধিকার কেবল সুপার অ্যাডমিনের রয়েছে!');
    if (email.toLowerCase() === superAdminEmail.toLowerCase()) return alert('সুপার অ্যাডমিন অ্যাকাউন্ট ডিলিট সম্ভব নয়!');
    if (confirm('এই সাব-অ্যাডমিন অ্যাকাউন্টটি ডিলিট করতে চান?')) {
      await deleteAdminUser(email);
      setRegisteredAdmins((await getAdminUsers()).map(a => ({ name: a.name, email: a.email, isSuper: a.isSuper })));
      setSubAdminSuccess('অ্যাকাউন্টটি মুছে ফেলা হয়েছে।');
      setTimeout(() => setSubAdminSuccess(''), 4000);
    }
  };

  const handleToggleInquiryStatus = async (inq: Inquiry) => {
    const newStatus = inq.status === 'new' ? 'read' : 'new';
    setInquiries((prev: Inquiry[]) => prev.map((i: Inquiry) => i.id === inq.id ? { ...i, status: newStatus } : i));
    await dbService.updateInquiryStatus(inq.id, newStatus);
  };

  if (!isAuthenticated) {
    return (
      <AuthGate 
        userEmail={userEmail}
        isSuperAdminCreated={isSuperAdminCreated}
        registeredAdminsCount={registeredAdmins.length}
        onAdminsUpdated={setRegisteredAdmins}
        onLoginSuccess={(name, email) => {
          setCurrentAdminName(name);
          setCurrentAdminEmail(email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[750px] bg-[#F4F6FA] text-slate-800 font-sans border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative">
      
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAdminName={currentAdminName}
        isSubAdmin={isSubAdmin}
        onLogout={handleLogout}
        onResetDatabase={onResetDatabase}
        stats={{
          properties: properties.length,
          companies: companies.length,
          categories: categories.length,
          inquiries: inquiries.filter(i => i.status === 'new').length,
          subAdmins: registeredAdmins.length
        }}
      />

      <div className="flex-1 flex flex-col min-w-0" id="main-canvas">
        {/* Top Header */}
        <div className="bg-white border-b border-[#e2e6ef] py-3.5 px-5 flex items-center justify-between z-10 select-none">
          <h1 className="text-sm font-semibold text-[#1a2a4a] tracking-tight">
            {activeTab === 'dashboard' && 'ড্যাশবোর্ড'}
            {activeTab === 'properties' && 'প্রপার্টি ইনভেন্টরি'}
            {activeTab === 'companies' && 'পার্টনার কোম্পানি কন্ট্রোলার'}
            {activeTab === 'categories' && 'প্রজেক্ট ক্যাটাগরি ম্যানেজার'}
            {activeTab === 'inquiries' && 'ইনকোয়ারী মনিটর'}
            {activeTab === 'settings' && 'ওয়েবসাইট সেটিংস'}
            {activeTab === 'subadmins' && 'সাব-অ্যাডমিন কন্ট্রোল সেন্ট্রাল'}
          </h1>
          
          <div className="flex items-center gap-2.5">
            {inquiries.filter(i => i.status === 'new').length > 0 ? (
              <div className="bg-[#FEF3C7] text-[#92400E] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-tight">
                {toBn(inquiries.filter(i => i.status === 'new').length)}টি নতুন ইনকোয়ারি
              </div>
            ) : (
              <div className="bg-slate-100 text-slate-500 text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-tight">
                কোনো নতুন ইনকোয়ারি নেই
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Workspace */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {activeTab === 'dashboard' && <DashboardView properties={properties} companies={companies} categories={categories} inquiries={inquiries} setActiveTab={setActiveTab} onToggleInquiry={handleToggleInquiryStatus} onEditProperty={openEditPropertyForm} toBn={toBn} formatTime={formatTime} />}
          {activeTab === 'properties' && <PropertiesView properties={properties} categories={categories} onAddProperty={openNewPropertyForm} onEditProperty={openEditPropertyForm} onDeleteProperty={handleDeleteProperty} toBn={toBn} />}
          {activeTab === 'settings' && <SettingsView localSettings={localSettings} setLocalSettings={setLocalSettings} onSave={handleSaveSettings} isSubAdmin={isSubAdmin} successMessage={settingsSuccess} />}
          {activeTab === 'categories' && <CategoriesView categories={categories} newCatName={newCatName} setNewCatName={setNewCatName} newCatSlug={newCatSlug} setNewCatSlug={setNewCatSlug} editingCatId={editingCatId} catError={catError} catSuccess={catSuccess} onAdd={handleAddCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />}
          {activeTab === 'companies' && <CompaniesView companies={companies} newCompanyName={newCompanyName} setNewCompanyName={setNewCompanyName} newCompanyEstablished={newCompanyEstablished} setNewCompanyEstablished={setNewCompanyEstablished} newCompanyLogo={newCompanyLogo} setNewCompanyLogo={setNewCompanyLogo} compError={compError} compSuccess={compSuccess} onAdd={handleAddCompany} onDelete={handleDeleteCompany} />}
          {activeTab === 'inquiries' && <InquiriesView inquiries={inquiries} onToggleInquiry={handleToggleInquiryStatus} toBn={toBn} formatTime={formatTime} />}
          {activeTab === 'subadmins' && <SubAdminsView registeredAdmins={registeredAdmins} superAdminEmail={superAdminEmail} isSubAdmin={isSubAdmin} subAdminName={subAdminName} setSubAdminName={setSubAdminName} subAdminEmail={subAdminEmail} setSubAdminEmail={setSubAdminEmail} subAdminPassword={subAdminPassword} setSubAdminPassword={setSubAdminPassword} subAdminError={subAdminError} subAdminSuccess={subAdminSuccess} onAdd={handleAddSubAdmin} onDelete={handleDeleteSubAdmin} toBn={toBn} />}
        </div>
      </div>

      {/* PROPERTY MODAL FORM */}
      {isPropertyFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
            <div className="sticky top-0 bg-slate-50 border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-sm font-bold text-[#0B2545]">{editingProperty ? 'প্রপার্টি সংশোধন' : 'নতুন প্রজেক্ট'}</h3>
              <button onClick={() => setIsPropertyFormOpen(false)} className="h-8 w-8 rounded-full bg-slate-200/50 hover:bg-slate-200/80 flex items-center justify-center cursor-pointer transition-colors"><X className="h-4.5 w-4.5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">টাইটেল:</label>
                  <input type="text" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি:</label>
                  <select value={propCategory} onChange={(e) => setPropCategory(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">কোম্পানি:</label>
                  <select value={propCompany} onChange={(e) => setPropCompany(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]">
                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">লোকেশন:</label>
                  <input type="text" value={propLocation} onChange={(e) => setPropLocation(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">মূল্য:</label>
                  <input type="text" value={propPrice} onChange={(e) => setPropPrice(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">স্ট্যাটাস:</label>
                  <input type="text" value={propStatus} onChange={(e) => setPropStatus(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">সাইজ:</label>
                  <input type="number" value={propSize} onChange={(e) => setPropSize(parseInt(e.target.value) || 0)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>

                {propCategory !== 'cat-2' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">বেডরুম:</label>
                      <input type="number" value={propBedrooms} onChange={(e) => setPropBedrooms(parseInt(e.target.value) || 0)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">বাথরুম:</label>
                      <input type="number" value={propBathrooms} onChange={(e) => setPropBathrooms(parseInt(e.target.value) || 0)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">দিক:</label>
                  <input type="text" value={propFacing} onChange={(e) => setPropFacing(e.target.value)} className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" />
                </div>
                
                <div className="sm:col-span-2 flex items-center space-x-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <input type="checkbox" id="featured-checkbox" checked={propFeatured} onChange={(e) => setPropFeatured(e.target.checked)} className="cursor-pointer" />
                  <label htmlFor="featured-checkbox" className="font-bold cursor-pointer text-slate-700">
                    ★ প্রিমিয়াম শোকেসে প্রদর্শন করুন
                  </label>
                </div>
              </div>

              {/* MEDIA SECTION - DEVICE UPLOADS ONLY */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <label className="block text-xs font-semibold text-slate-700">প্রজেক্ট মিডিয়া (ডিভাইস থেকে আপলোড করুন):</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Image Upload Area */}
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-amber-50/50 rounded-xl p-4 text-xs font-semibold text-slate-600 bg-white cursor-pointer transition-all h-24">
                      {isUploadingImage ? (
                        <Loader2 className="h-5 w-5 text-[#C9A84C] animate-spin" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="text-center">{isUploadingImage ? 'ছবি আপলোড হচ্ছে...' : 'ছবি নির্বাচন করুন'}<br/><span className="text-[9px] font-normal text-slate-400">(সর্বোচ্চ ৫টি)</span></span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingImage}
                        onChange={async (e) => {
                          if (e.target.files) {
                            const filesArr = Array.from(e.target.files);
                            const remainingCount = 5 - propImages.length;
                            if (remainingCount <= 0) {
                              alert('আপনি সর্বোচ্চ ৫টি ছবি আপলোড করতে পারবেন!');
                              return;
                            }
                            const targetFiles = filesArr.slice(0, remainingCount);

                            setMediaError('');
                            setIsUploadingImage(true);
                            try {
                              for (const file of targetFiles) {
                                const url = await uploadPropertyImage(file);
                                setPropImages((prev: string[]) => (prev.length < 5 ? [...prev, url] : prev));
                              }
                            } catch (err: any) {
                              setMediaError(err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে।');
                            } finally {
                              setIsUploadingImage(false);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Image Previews */}
                    {propImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-slate-100 min-h-[68px]">
                        {propImages.map((img, idx) => (
                          <div key={idx} className="relative h-12 w-16 border border-slate-200 rounded-lg group overflow-hidden shadow-sm shrink-0">
                            <img src={img} className="h-full w-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => {
                                const removed = propImages[idx];
                                setPropImages(propImages.filter((_, i) => i !== idx));
                                deleteStorageFileByUrl(removed).catch(() => {});
                              }} 
                              className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                              title="মুছে ফেলুন"
                            >
                              <X className="h-4 w-4"/>
                            </button>
                            <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-tl-sm">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload Area */}
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-amber-50/50 rounded-xl p-4 text-xs font-semibold text-slate-600 bg-white cursor-pointer transition-all h-24">
                      {isUploadingVideo ? (
                        <Loader2 className="h-5 w-5 text-[#C9A84C] animate-spin" />
                      ) : (
                        <FileVideo className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="text-center">{isUploadingVideo ? 'ভিডিও আপলোড হচ্ছে...' : 'ভিডিও নির্বাচন করুন'}<br/><span className="text-[9px] font-normal text-slate-400">(সর্বোচ্চ ১টি)</span></span>
                      <input
                        type="file"
                        accept="video/*"
                        disabled={isUploadingVideo}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 20 * 1024 * 1024) { 
                              alert('ভিডিওর সাইজ ২০ মেগাবাইটের বেশি হতে পারবে না!');
                              return;
                            }
                            setMediaError('');
                            setIsUploadingVideo(true);
                            try {
                              const url = await uploadPropertyVideo(file);
                              setPropVideoUrl(url);
                            } catch (err: any) {
                              setMediaError(err?.message || 'ভিডিও আপলোড ব্যর্থ হয়েছে।');
                            } finally {
                              setIsUploadingVideo(false);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Video Preview confirmation */}
                    {propVideoUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm min-h-[68px]">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="h-10 w-12 bg-slate-900 rounded flex items-center justify-center text-white shrink-0 shadow-inner">
                            <span className="text-[8px] font-sans font-bold">MP4</span>
                          </div>
                          <div className="truncate text-left leading-tight">
                            <span className="text-[9px] font-black text-slate-700 uppercase block">ভিডিও সংযুক্ত</span>
                            <span className="text-[8px] text-slate-400 truncate w-full block">ডিভাইস আপলোড (Base64)</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const removed = propVideoUrl;
                            setPropVideoUrl('');
                            deleteStorageFileByUrl(removed).catch(() => {});
                          }} 
                          className="h-7 w-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="ভিডিও মুছে ফেলুন"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Status / Error Row */}
              {(isUploadingImage || isUploadingVideo) && (
                <p className="text-[10px] text-amber-600 font-semibold mt-1">আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
              )}
              {mediaError && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{mediaError}</p>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">বিবরণ:</label>
                <textarea 
                  rows={4} 
                  value={propDesc} 
                  onChange={(e) => setPropDesc(e.target.value)} 
                  className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]" 
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t px-6 py-4 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsPropertyFormOpen(false)} 
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold cursor-pointer transition-colors"
              >
                বাতিল
              </button>
              <button 
                type="button" 
                onClick={handleSaveProperty} 
                className="rounded-xl bg-[#0B2545] hover:bg-[#122e4e] text-white px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" /><span> সেভ করুন </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}