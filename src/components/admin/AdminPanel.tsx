import React, { useState, useEffect } from 'react';
import { 
  Settings, Layers, Home, Eye, Plus, Save, Trash2, Edit, AlertCircle, 
  Sparkles, Building2, Lock, FileText, Check, Phone, X, LayoutDashboard,
  Mail, Users, FolderOpen, TrendingUp, Globe, Upload, Image as ImageIcon,
  LogOut
} from 'lucide-react';
import { SiteSettings, Category, Company, Property } from '../../types';

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

interface Inquiry {
  id: string;
  name: string;
  category: string;
  location: string;
  budget: string;
  phone: string;
  time: string;
  isNew: boolean;
  tagClass: 'tag-flat' | 'tag-land' | 'tag-comm';
}

export default function AdminPanel({
  settings,
  categories,
  companies,
  properties,
  onUpdateSettings,
  onUpdateCategories,
  onUpdateCompanies,
  onUpdateProperties,
  onResetDatabase,
  userEmail
}: AdminPanelProps) {
  // Authentication structure with localStorage persistence
  const [registeredAdmins, setRegisteredAdmins] = useState<{name: string, email: string, password: string, isSuper?: boolean}[]>(() => {
    const raw = localStorage.getItem('astha_admins_registered');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Safe fallback
      }
    }
    // Preloaded default administrators including user's specific email address
    const defaults = [
      { name: 'Amit Ghosh', email: 'amitghosh.115127@gmail.com', password: 'SaintLouis2026!', isSuper: true },
      { name: 'Admin Developer', email: 'developer@astha.com', password: 'admin123', isSuper: false }
    ];
    localStorage.setItem('astha_admins_registered', JSON.stringify(defaults));
    localStorage.setItem('astha_super_admin_email', 'amitghosh.115127@gmail.com');
    localStorage.setItem('astha_super_admin_created', 'true');
    return defaults;
  });

  const [superAdminEmail, setSuperAdminEmail] = useState<string>(() => {
    const stored = localStorage.getItem('astha_super_admin_email');
    if (stored) return stored;
    return 'amitghosh.115127@gmail.com';
  });

  const [isSuperAdminCreated, setIsSuperAdminCreated] = useState<boolean>(() => {
    const stored = localStorage.getItem('astha_super_admin_created');
    if (stored) return stored === 'true';
    return true; // Default to true because defaults contains Amit Ghosh
  });

  // Sub-Admins section management states
  const [subAdminName, setSubAdminName] = useState<string>('');
  const [subAdminEmail, setSubAdminEmail] = useState<string>('');
  const [subAdminPassword, setSubAdminPassword] = useState<string>('');
  const [subAdminError, setSubAdminError] = useState<string>('');
  const [subAdminSuccess, setSubAdminSuccess] = useState<string>('');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>(userEmail || 'amitghosh.115127@gmail.com');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>('');

  // Sign Up fields
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('amitghosh.115127@gmail.com');
  const [signupPassword, setSignupPassword] = useState<string>('SaintLouis2026!');

  // Logged-in admin credentials
  const [currentAdminName, setCurrentAdminName] = useState<string>('Amit Ghosh');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('amitghosh.115127@gmail.com');

  // Active Workspace tab state matching sidebar layout
  // 'dashboard' | 'properties' | 'companies' | 'categories' | 'inquiries' | 'settings' | 'subadmins'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'companies' | 'categories' | 'inquiries' | 'settings' | 'subadmins'>('dashboard');

  // Local state for Site Settings edits
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);

  // States for Category Management
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatSlug, setNewCatSlug] = useState<string>('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catError, setCatError] = useState<string>('');
  const [catSuccess, setCatSuccess] = useState<string>('');

  // States for Company Management
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newCompanyEstablished, setNewCompanyEstablished] = useState<string>('');
  const [newCompanyLogo, setNewCompanyLogo] = useState<string>('🏢');
  const [compError, setCompError] = useState<string>('');
  const [compSuccess, setCompSuccess] = useState<string>('');

  // States for Property Management Modals
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Property Form Inputs
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

  // Mock interactive Inquiries list based closely on mockup image & HTML structure
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 'inq-1',
      name: 'মো. কামাল হোসেন',
      category: 'ফ্ল্যাট',
      location: 'মিরপুর',
      budget: '৬০ লাখ',
      phone: '০১৭৩৩-৪৫৬৭৮৯',
      time: '৩ মিনিট আগে',
      isNew: true,
      tagClass: 'tag-flat'
    },
    {
      id: 'inq-2',
      name: 'নাসরিন আক্তার',
      category: 'জমি',
      location: 'পূর্বাচল',
      budget: '১ কোটি',
      phone: '০১৮৫১-৯৮৭৬৫৪',
      time: '২২ মিনিট আগে',
      isNew: true,
      tagClass: 'tag-land'
    },
    {
      id: 'inq-3',
      name: 'Faruk K. (UK)',
      category: 'কমার্শিয়াল',
      location: 'গুলশান',
      budget: '২+ কোটি',
      phone: '+44 7700 900077',
      time: '১ ঘণ্টা আগে',
      isNew: true,
      tagClass: 'tag-comm'
    },
    {
      id: 'inq-4',
      name: 'রহিমা বেগম',
      category: 'ফ্ল্যাট',
      location: 'উত্তরা',
      budget: '৪৫ লাখ',
      phone: '০১৯১২-৩৪৫৬৭৮',
      time: 'গতকাল',
      isNew: false,
      tagClass: 'tag-flat'
    }
  ]);

  // Keep local settings in sync with root props
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Read current active administrator level
  const isSubAdmin = currentAdminEmail.toLowerCase() !== superAdminEmail.toLowerCase();

  // UX session restore: retain authentication state upon quick reloads
  useEffect(() => {
    const savedEmail = localStorage.getItem('astha_active_admin_email');
    const savedName = localStorage.getItem('astha_active_admin_name');
    if (savedEmail && savedName) {
      const exists = registeredAdmins.some(admin => admin.email.toLowerCase() === savedEmail.toLowerCase());
      if (exists) {
        setIsAuthenticated(true);
        setCurrentAdminName(savedName);
        setCurrentAdminEmail(savedEmail);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('astha_active_admin_email');
    localStorage.removeItem('astha_active_admin_name');
    setIsAuthenticated(false);
    setCurrentAdminEmail('');
    setCurrentAdminName('');
    window.location.hash = ''; // Clear hash to navigate back to index/home
  };

  // Auth processing
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!authEmail.trim() || !authPassword) {
      setAuthError('দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই ইংরেজিতে পূরণ করুন!');
      return;
    }

    const foundAdmin = registeredAdmins.find(
      admin => admin.email.toLowerCase() === authEmail.trim().toLowerCase() && admin.password === authPassword
    );

    if (foundAdmin) {
      setIsAuthenticated(true);
      setCurrentAdminName(foundAdmin.name);
      setCurrentAdminEmail(foundAdmin.email);
      localStorage.setItem('astha_active_admin_name', foundAdmin.name);
      localStorage.setItem('astha_active_admin_email', foundAdmin.email);
    } else {
      setAuthError('প্রদত্ত ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়! পুনরায় চেষ্টা করুন।');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
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

    // Check if email already registered
    const exists = registeredAdmins.some(admin => admin.email.toLowerCase() === signupEmail.trim().toLowerCase());
    if (exists) {
      setAuthError('এই ইমেইলটি ইতিমধ্যে অ্যাডমিন হিসেবে রেজিস্টার্ড রয়েছে! অনুগ্রহ করে সরাসরি লগইন করুন।');
      return;
    }

    const newAdmin = {
      name: signupName.trim(),
      email: signupEmail.trim().toLowerCase(),
      password: signupPassword,
      isSuper: true
    };

    const updatedAdmins = [...registeredAdmins, newAdmin];
    setRegisteredAdmins(updatedAdmins);
    localStorage.setItem('astha_admins_registered', JSON.stringify(updatedAdmins));
    localStorage.setItem('astha_super_admin_email', newAdmin.email);
    localStorage.setItem('astha_super_admin_created', 'true');
    setSuperAdminEmail(newAdmin.email);
    setIsSuperAdminCreated(true);

    setAuthSuccessMsg('অভিনন্দন! আপনার সুপার অ্যাডমিন অ্যাকাউন্ট রেজিস্টার হয়েছে। এবার লগইন করুন।');
    setAuthEmail(newAdmin.email);
    setAuthPassword(newAdmin.password);
    setAuthMode('login');
  };

  // Site Settings saving
  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Category controllers
  const handleAddCategory = () => {
    setCatError('');
    setCatSuccess('');
    
    if (!newCatName.trim()) {
      setCatError('দয়া করে ক্যাটাগরি বাংলা নাম পূরণ করুন!');
      return;
    }
    if (!newCatSlug.trim()) {
      setCatError('দয়া করে Slug বা ইউনিক ইংরেজি কোড পূরণ করুন!');
      return;
    }

    const normalizedSlug = newCatSlug.trim().toLowerCase().replace(/\s+/g, '-');
    const slugInUse = categories.some(c => c.slug === normalizedSlug && c.id !== editingCatId);
    if (slugInUse) {
      setCatError('এই ইউনিক কোডটি (Slug) অন্য একটি ক্যাটাগরিতে ব্যবহার করা হয়েছে! দয়া করে ভিন্ন কোড ব্যবহার করুন।');
      return;
    }

    const catId = editingCatId || `cat-${Date.now()}`;
    const targetCat: Category = { id: catId, name: newCatName.trim(), slug: normalizedSlug };

    let updated: Category[];
    if (editingCatId) {
      updated = categories.map(c => c.id === editingCatId ? targetCat : c);
      setCatSuccess('ক্যাটাগরি তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      updated = [...categories, targetCat];
      setCatSuccess('নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে!');
    }

    onUpdateCategories(updated);
    setNewCatName('');
    setNewCatSlug('');
    setEditingCatId(null);
    
    setTimeout(() => {
      setCatSuccess('');
    }, 4000);
  };

  const handleEditCategory = (cat: Category) => {
    setCatError('');
    setCatSuccess('');
    setNewCatName(cat.name);
    setNewCatSlug(cat.slug);
    setEditingCatId(cat.id);
  };

  const handleDeleteCategory = (id: string) => {
    if (isSubAdmin) {
      setCatError('দুঃখিত, সাব-অ্যাডমিনদের প্রজেক্ট ক্যাটাগরি/টাইপ মুছে ফেলার অনুমতি নেই!');
      return;
    }
    setCatError('');
    setCatSuccess('');
    
    if (categories.length <= 1) {
      setCatError('সর্বনিম্ন একটি ক্যাটাগরি থাকতে হবে! এটি ডিলিট করা সম্ভব নয়।');
      return;
    }
    
    const updated = categories.filter(c => c.id !== id);
    onUpdateCategories(updated);
    setCatSuccess('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!');
    
    if (editingCatId === id) {
      setNewCatName('');
      setNewCatSlug('');
      setEditingCatId(null);
    }

    setTimeout(() => {
      setCatSuccess('');
    }, 4000);
  };

  // Company controllers
  const handleCompanyLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewCompanyLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCompany = () => {
    setCompError('');
    setCompSuccess('');

    if (!newCompanyName.trim()) {
      setCompError('দয়া করে কোম্পানির নাম (বাংলায়) পূরণ করুন!');
      return;
    }

    const compId = `comp-${Date.now()}`;
    const newComp: Company = {
      id: compId,
      companyName: newCompanyName.trim(),
      logoUrl: newCompanyLogo || '🏢',
      established: newCompanyEstablished.trim() || '২০১৫'
    };

    onUpdateCompanies([...companies, newComp]);
    setNewCompanyName('');
    setNewCompanyEstablished('');
    setNewCompanyLogo('🏢');
    setCompSuccess('নতুন অংশীদার কোম্পানি সফলভাবে যুক্ত করা হয়েছে!');

    setTimeout(() => {
      setCompSuccess('');
    }, 4500);
  };

  const handleDeleteCompany = (id: string) => {
    if (isSubAdmin) {
      setCompError('দুঃখিত, সাব-অ্যাডমিনদের অংশীদার কোম্পানি মুছে ফেলার অনুমতি নেই!');
      return;
    }
    setCompError('');
    setCompSuccess('');

    if (companies.length <= 1) {
      setCompError('তালিকায় অন্তত একটি কোম্পানি রাখা আবশ্যক! এটি ডিলিট সম্ভব নয়।');
      return;
    }

    const updated = companies.filter(c => c.id !== id);
    onUpdateCompanies(updated);
    setCompSuccess('কোম্পানি সফলভাবে তালিকা থেকে অপসারিত হয়েছে!');

    setTimeout(() => {
      setCompSuccess('');
    }, 4000);
  };

  // Property handlers
  const openNewPropertyForm = () => {
    setEditingProperty(null);
    setPropTitle('');
    setPropPrice('');
    setPropLocation('');
    setPropCategory(categories[0]?.id || '');
    setPropCompany(companies[0]?.id || '');
    setPropDesc('');
    setPropImages([]);
    setPropVideoUrl('');
    setPropStatus('Available');
    setPropSize(1800);
    setPropBedrooms(3);
    setPropBathrooms(3);
    setPropFacing('দক্ষিণমুখী');
    setPropFeatured(false);
    setIsPropertyFormOpen(true);
  };

  const openEditPropertyForm = (p: Property) => {
    setEditingProperty(p);
    setPropTitle(p.title);
    setPropPrice(p.price);
    setPropLocation(p.location);
    setPropCategory(p.categoryId);
    setPropCompany(p.companyId);
    setPropDesc(p.description);
    setPropImages(p.images || []);
    setPropVideoUrl(p.videoUrl || '');
    setPropStatus(p.status);
    setPropSize(p.size || 2000);
    setPropBedrooms(p.bedrooms || 3);
    setPropBathrooms(p.bathrooms || 3);
    setPropFacing(p.facing || 'দক্ষিণমুখী');
    setPropFeatured(p.isFeatured);
    setIsPropertyFormOpen(true);
  };

  const handleSaveProperty = () => {
    if (!propTitle || !propPrice || !propLocation) {
      alert('অনুগ্রহ করে প্রপার্টি শিরোনাম, মূল্য এবং লোকেশন প্রদান করুন!');
      return;
    }

    const defaultImg = propCategory === 'cat-2' || propCategory === 'cat-3' 
      ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800';

    const finalImages = propImages.length > 0 ? propImages : [defaultImg];

    const savedProp: Property = {
      id: editingProperty?.id || `prop-${Date.now()}`,
      title: propTitle.trim(),
      description: propDesc.trim() || 'আস্থার ঠিকানা দ্বারা সম্পূর্ণ স্ক্রিন ও আইনি দলিলাদি যাচাইকৃত একটি প্রিমিয়াম প্রজেক্ট। বিস্তারিত জানতে সরাসরি যোগাযোগ করুন।',
      price: propPrice.trim(),
      location: propLocation.trim(),
      categoryId: propCategory,
      companyId: propCompany,
      images: finalImages,
      videoUrl: propVideoUrl.trim() || undefined,
      isFeatured: propFeatured,
      status: propStatus,
      size: propSize,
      bedrooms: propCategory === 'cat-2' || propCategory === 'cat-3' ? undefined : propBedrooms,
      bathrooms: propCategory === 'cat-2' || propCategory === 'cat-3' ? undefined : propBathrooms,
      facing: propFacing
    };

    let updated: Property[];
    if (editingProperty) {
      updated = properties.map(p => p.id === editingProperty.id ? savedProp : p);
    } else {
      updated = [savedProp, ...properties];
    }

    onUpdateProperties(updated);
    setIsPropertyFormOpen(false);
    setEditingProperty(null);
  };

  const handleDeleteProperty = (id: string) => {
    if (isSubAdmin) {
      alert('দুঃখিত, সাব-অ্যাডমিনদের প্রজেক্ট মুছে ফেলার অনুমতি নেই!');
      return;
    }
    if (confirm('আপনি কি নিশ্চিতভাবে এই প্রজেক্টটি ডিলিট করতে চান?')) {
      const updated = properties.filter(p => p.id !== id);
      onUpdateProperties(updated);
    }
  };

  // Sub-Admins management logic
  const handleAddSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminError('');
    setSubAdminSuccess('');

    if (isSubAdmin) {
      setSubAdminError('দুঃখিত, শুধুমাত্র সুপার অ্যাডমিন নতুন সাব-অ্যাডমিন যুক্ত করতে পারেন!');
      return;
    }

    if (!subAdminName.trim() || !subAdminEmail.trim() || !subAdminPassword.trim()) {
      setSubAdminError('দয়া করে সবগুলো তথ্য (নাম, ইমেইল এবং পিন/পাসওয়ার্ড) ইংরেজিতে পূরণ করুন।');
      return;
    }

    const emailLower = subAdminEmail.trim().toLowerCase();
    const exists = registeredAdmins.some(admin => admin.email.toLowerCase() === emailLower);
    if (exists) {
      setSubAdminError('এই ইমেইলটি ইতিমধ্যে অ্যাডমিন তালিকায় রেজিস্টার্ড রয়েছে!');
      return;
    }

    const newSub = {
      name: subAdminName.trim(),
      email: emailLower,
      password: subAdminPassword.trim(),
      isSuper: false
    };

    const updated = [...registeredAdmins, newSub];
    setRegisteredAdmins(updated);
    localStorage.setItem('astha_admins_registered', JSON.stringify(updated));

    setSubAdminSuccess(`নতুন সাব-অ্যাডমিন "${newSub.name}" সফলভাবে তালিকায় যুক্ত হয়েছে! তারা এই ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি লগইন করতে পারবেন।`);
    setSubAdminName('');
    setSubAdminEmail('');
    setSubAdminPassword('');

    setTimeout(() => {
      setSubAdminSuccess('');
    }, 5000);
  };

  const handleDeleteSubAdmin = (email: string) => {
    if (isSubAdmin) {
      alert('দুঃখিত, সাব-অ্যাডমিন ডিলিট করার অধিকার কেবল সুপার অ্যাডমিনের রয়েছে!');
      return;
    }

    if (email.toLowerCase() === superAdminEmail.toLowerCase()) {
      alert('সুপার অ্যাডমিন অ্যাকাউন্টকে ডিলিট করা সম্ভব নয়!');
      return;
    }

    if (confirm('আপনি কি নিশ্চিতভাবে এই সাব-অ্যাডমিন অ্যাকাউন্টটি ডিলিট করতে চান?')) {
      const updated = registeredAdmins.filter(admin => admin.email.toLowerCase() !== email.toLowerCase());
      setRegisteredAdmins(updated);
      localStorage.setItem('astha_admins_registered', JSON.stringify(updated));
      setSubAdminSuccess('সাব-অ্যাডমিন অ্যাকাউন্টটি তালিকা থেকে সফলভাবে মুছে ফেলা হয়েছে।');
      
      setTimeout(() => {
        setSubAdminSuccess('');
      }, 4000);
    }
  };

  // Toggle state of an inquiry dot on click
  const handleToggleInquiryStatus = (id: string) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, isNew: !inq.isNew } : inq
    ));
  };

  // Render Login Gate
  if (!isAuthenticated) {
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

          {/* Secure mode switch tabs to sign up as an admin */}
          {isSuperAdminCreated ? (
            <div className="text-center text-[10px] text-indigo-950 bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xl mb-5 select-none font-sans font-medium">
              🔒 আস্থার সেন্ট্রাল সিকিউরড সেশন সক্রিয় (নতুন সাইন-আপ নিষ্ক্রিয় করা আছে)
            </div>
          ) : (
            <div className="flex border border-slate-200 rounded-xl overflow-hidden p-1 bg-slate-50 mb-5 text-center text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  authMode === 'login' 
                    ? 'bg-[#0B2545] text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                লগইন অ্যাকাউন্ট
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  authMode === 'signup' 
                    ? 'bg-[#0B2545] text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="signup-tab-btn"
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
                  className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">পাসওয়ার্ড:</label>
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
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
                  className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="উদা: অমিত ঘোষ"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">প্রশাসক ইমেইল (Email):</label>
                <input 
                  type="email" 
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="example@gmail.com"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">আপনার ব্যক্তিগত ইমেইল থেকে জয়েন করতে পারেন</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">পাসওয়ার্ড (Password):</label>
                <input 
                  type="password" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs text-black bg-white focus:ring-2 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                  placeholder="••••••••"
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

          {/* Direct Demo Admin Login Bypass without requiring credentials or signups */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2.5 text-slate-400">অথবা ডেমো প্রবেশ</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAuthenticated(true);
              setCurrentAdminName('অমিত ঘোষ (ডেমো)');
              setCurrentAdminEmail('amitghosh.115127@gmail.com');
              // Save to localStorage
              localStorage.setItem('astha_active_admin_name', 'অমিত ঘোষ (ডেমো)');
              localStorage.setItem('astha_active_admin_email', 'amitghosh.115127@gmail.com');
            }}
            className="w-full rounded-xl border border-[#C9A84C] bg-amber-50/55 text-amber-950 hover:bg-amber-100/50 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer animate-pulse"
            id="demo-login-bypass"
          >
            <Sparkles className="h-4.5 w-4.5 text-[#C9A84C]" />
            <span>সরাসরি ডেমো অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
          </button>

          <button
            type="button"
            onClick={() => { window.location.hash = ''; }}
            className="w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-100 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer mt-3 font-sans"
          >
            <Globe className="h-4 w-4 text-slate-500" />
            <span>ওয়েবসাইটে ফিরে যান (Back to Website)</span>
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[750px] bg-[#F4F6FA] text-slate-800 font-sans border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative" id="admin-panel-main">
      
      {/* SIDEBAR CONTAINER: Exact same deep blue background and golden highlighting */}
      <div className="w-full lg:w-[220px] bg-[#0B2545] flex-shrink-0 flex flex-col font-sans" id="db-sidebar">
        {/* Sidebar Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img 
              src="https://xhaonenygjvgrpbstmky.supabase.co/storage/v1/object/public/Assets/ChatGPT%20Image%20Jun%2017,%202026,%2003_55_25%20AM%20(1).png"
              alt="Astha Real Estate Logo"
              className="h-8 w-auto object-contain bg-white/10 p-1 rounded"
              referrerPolicy="no-referrer"
            />
            <div className="text-left leading-tight">
              <div className="text-[#C9A84C] text-[13px] font-bold tracking-wide font-sans truncate max-w-[120px]">আস্থা রিয়েল এস্টেট</div>
              <div className="text-white/35 text-[8px] tracking-wider uppercase mt-0.5">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-3 text-slate-300 space-y-1 select-none">
          
          <div className="px-4 py-2 text-white/30 text-[9px] uppercase tracking-wider font-bold">মেইন</div>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
              activeTab === 'dashboard' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
              activeTab === 'properties' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>প্রপার্টি ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
              activeTab === 'companies' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>কোম্পানি ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
              activeTab === 'categories' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>প্রজেক্ট টাইপ ({categories.length})</span>
          </button>

          <div className="px-4 py-2 pt-3 text-white/30 text-[9px] uppercase tracking-wider font-bold">লিড</div>
          
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all border-l-2 outline-none ${
              activeTab === 'inquiries' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4" />
              <span>ইনকোয়ারি</span>
            </div>
            <span className="bg-red-500 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full mr-1">৮</span>
          </button>

          <button
            onClick={() => setActiveTab('subadmins')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
              activeTab === 'subadmins' 
                ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>সাব-অ্যাডমিন্স ({registeredAdmins.length})</span>
          </button>

          <div className="px-4 py-2 pt-3 text-white/30 text-[9px] uppercase tracking-wider font-bold font-sans">সাইট</div>
          
          {!isSubAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-all border-l-2 outline-none ${
                activeTab === 'settings' 
                  ? 'bg-[#C9A84C]/12 text-[#C9A84C] border-l-[#C9A84C] font-semibold' 
                  : 'border-l-transparent text-white/55 hover:bg-white/5 hover:text-white/85'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>সেটিংস</span>
            </button>
          )}

          {/* Setup reset helper button */}
          <div className="pt-2 px-2">
            <button
              onClick={onResetDatabase}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-white/5 text-[9px] text-white/40 hover:text-white/80 hover:bg-white/10 transition-all font-sans"
              title="রি-ফরম্যাট করুন"
            >
              রি-ফরম্যাট করুন
            </button>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 bg-black/10 flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-[#C9A84C] text-[#0B2545] font-bold text-xs flex items-center justify-center shadow-md shrink-0">
              {currentAdminName.trim().charAt(0) || 'A'}
            </div>
            <div className="text-left leading-none overflow-hidden">
              <div className="text-white/90 text-xs font-semibold font-sans truncate pr-1 max-w-[100px]">{currentAdminName}</div>
              <div className="text-[7.5px] font-sans font-bold text-[#C9A84C] mt-1.5 uppercase tracking-wide">
                {isSubAdmin ? 'Sub-Admin 🔒' : 'Super Admin 👑'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/5 transition-all outline-none shrink-0 cursor-pointer"
            title="লগআউট করুন"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT CANVAS: Light gray background */}
      <div className="flex-1 flex flex-col min-w-0" id="main-canvas">
        
        {/* Topbar matching exact style layout */}
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
            <div className="bg-[#FEF3C7] text-[#92400E] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-tight">
              ৮টি নতুন ইনকোয়ারি
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-[10px] md:text-sm font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              title="লগআউট করে প্রস্থান করুন"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* SCROLLING WORKSPACE */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">

          {/* ACTIVE VIEW TAB 0: DASHBOARD BENTO GRID (The Exact UI Mockup from mockup.html) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5" id="dashboard-bento-section">
              
              {/* Row 1: KPI Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Stat block 1 */}
                <div onClick={() => setActiveTab('properties')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-[#C9A84C]/50 transition-colors cursor-pointer text-left">
                  <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    <Home className="h-3.5 w-3.5" />
                    <span>মোট প্রপার্টি</span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
                    {370 + (properties.length - 12)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+১২ এই মাসে</span>
                  </div>
                </div>

                {/* Stat block 2 */}
                <div onClick={() => setActiveTab('inquiries')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-red-400/50 transition-colors cursor-pointer text-left">
                  <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>নতুন ইনকোয়ারি</span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
                    ৮
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>আজকের</span>
                  </div>
                </div>

                {/* Stat block 3 */}
                <div onClick={() => setActiveTab('companies')} className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs hover:border-[#C9A84C]/50 transition-colors cursor-pointer text-left">
                  <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>পার্টনার কোম্পানি</span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
                    {companies.length}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>সক্রিয়</span>
                  </div>
                </div>

                {/* Stat block 4 */}
                <div className="bg-white rounded-lg border border-[#e2e6ef] p-3.5 shadow-xs text-left">
                  <div className="text-[10px] font-bold text-[#8896b3] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    <span>মাসিক ভিজিটর</span>
                  </div>
                  <div className="text-2xl font-bold text-[#1a2a4a] tracking-tight leading-none">
                    ৪.২K
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+৩২%</span>
                  </div>
                </div>

              </div>

              {/* Row 2: Inquiries Left, Properties Right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Recent Inquiries Card */}
                <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
                  <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">সাম্প্রতিক ইনকোয়ারি</h3>
                    <button 
                      onClick={() => setActiveTab('inquiries')}
                      className="text-[10px] font-medium text-indigo-650 hover:underline"
                    >
                      সব দেখুন →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1">
                    {inquiries.map((inq) => (
                      <div 
                        key={inq.id} 
                        onClick={() => handleToggleInquiryStatus(inq.id)}
                        className="p-3 px-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="ক্লিক করে রিড/আনরিড মার্ক করুন"
                      >
                        {/* Dot indicator */}
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${inq.isNew ? 'bg-red-500' : 'bg-slate-300'}`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-[#1a2a4a]">{inq.name}</span>
                            
                            {/* Color tag block exactly like CSS file mockup styles */}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              inq.tagClass === 'tag-flat' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 
                              inq.tagClass === 'tag-land' ? 'bg-[#FEF9EE] text-[#B45309]' : 
                              'bg-[#F0FDF4] text-[#166534]'
                            }`}>
                              {inq.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {inq.location} · বাজেট: {inq.budget} · <span className="font-sans text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">📞 {inq.phone}</span>
                          </div>
                        </div>

                        <span className="text-[9px] text-[#b0bbd0] font-sans font-medium whitespace-nowrap mt-0.5">{inq.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Properties Card */}
                <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
                  <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">সাম্প্রতিক প্রপার্টি</h3>
                    <button 
                      onClick={() => setActiveTab('properties')}
                      className="text-[10px] font-medium text-indigo-650 hover:underline"
                    >
                      ম্যানেজ করুন →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 font-sans">
                    {/* Header Columns */}
                    <div className="grid grid-cols-12 gap-2 p-2 px-4 bg-slate-50 text-[9px] text-slate-400 uppercase font-bold tracking-wider select-none">
                      <div className="col-span-6 text-left">নাম / লোকেশন</div>
                      <div className="col-span-3 text-left">মূল্য</div>
                      <div className="col-span-2 text-center">স্ট্যাটাস</div>
                      <div className="col-span-1 text-center">অ্যাকশন</div>
                    </div>

                    {/* Sunset/Green/Purbachal list based on custom defaults or live state properties */}
                    {properties.slice(0, 4).map((prop, idx) => {
                      // Alternate mock names from mockup file for authenticity
                      const mockupInfo = [
                        { name: 'সানরাইজ রেসিডেন্স', loc: 'মিরপুর ১২, ঢাকা', price: '৳৫৫ লাখ', status: 'Available', statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
                        { name: 'গ্রিন ভ্যালি কমার্শিয়াল', loc: 'গুলশান ২, ঢাকা', price: '৳১.২ কোটি', status: 'Available', statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
                        { name: 'পূর্বাচল হ্যাভেন', loc: 'পূর্বাচল, ঢাকা', price: '৳৩৫ লাখ/কাঠা', status: 'Draft', statusClass: 'bg-slate-100 text-slate-600 border-slate-200' },
                        { name: 'রিভারভিউ ভিলা', loc: 'হাতিরঝিল, ঢাকা', price: '৳৩.৫ কোটি', status: 'Sold Out', statusClass: 'bg-rose-50 text-rose-700 border-rose-100' }
                      ];

                      const currentMock = mockupInfo[idx] || { 
                        name: prop.title, 
                        loc: prop.location, 
                        price: prop.price, 
                        status: prop.status,
                        statusClass: prop.status === 'Sold Out' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
                      };

                      return (
                        <div key={prop.id} className="grid grid-cols-12 gap-2 p-2.5 px-4 items-center text-[11px] font-sans hover:bg-slate-50">
                          <div className="col-span-6 text-left">
                            <div className="font-bold text-[#1a2a4a] leading-tight truncate">{currentMock.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{currentMock.loc}</div>
                          </div>
                          
                          <div className="col-span-3 text-left font-bold text-[#1a2a4a] truncate">
                            {currentMock.price}
                          </div>

                          <div className="col-span-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${currentMock.statusClass}`}>
                              {currentMock.status === 'Available' ? 'সক্রিয়' : currentMock.status === 'Draft' ? 'ড্রাফট' : 'বিক্রিত'}
                            </span>
                          </div>

                          <div className="col-span-1 text-center flex items-center justify-center gap-1">
                            <button 
                              onClick={() => openEditPropertyForm(prop)}
                              className="p-1 hover:text-[#0B2545] text-slate-400 transition"
                              title="সম্পাদনা"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>

              {/* Row 3: Hero Banner Config Left, Partner companies Right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Hero Banner Control panel block */}
                <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
                  <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">হিরো ব্যানার কন্ট্রোল</h3>
                    <span className="text-[10px] font-medium text-slate-400">প্রিভিউ করুন</span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Immersive preview inside gradient box exactly matching CSS */}
                    <div className="bg-gradient-to-br from-[#0B2545] to-[#1a3a6b] border border-[#C9A84C]/35 rounded-lg p-4 relative shadow-sm text-left">
                      <span className="inline-block bg-[#C9A84C]/25 text-[#C9A84C] text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 border border-[#C9A84C]/20">
                        ✦ বিশ্বস্ত প্রপার্টি পোর্টাল
                      </span>
                      <h4 className="text-white font-bold text-sm tracking-tight mb-1">
                        {localSettings.bannerTitle || 'আপনার স্বপ্নের ঘর এখন আর স্বপ্ন নয়'}
                      </h4>
                      <p className="text-white/55 text-[10px] font-medium mb-4">
                        {localSettings.bannerSubtitle || 'ঢাকা, চট্টগ্রাম ও সিলেটের সেরা প্রজেক্ট...'}
                      </p>

                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="absolute top-3.5 right-3.5 bg-white/10 hover:bg-white/20 text-white rounded text-[9px] font-semibold px-2 py-1 flex items-center gap-1 border border-white/15 cursor-pointer"
                      >
                        <Edit className="h-2.5 w-2.5" />
                        <span>সম্পাদনা</span>
                      </button>
                    </div>

                    {/* Slogan live modifier row */}
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={localSettings.bannerTitle}
                        onChange={(e) => setLocalSettings({ ...localSettings, bannerTitle: e.target.value })}
                        className="flex-1 text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] text-slate-800"
                        placeholder="আপনার স্বপ্নের ঘর এখন আর স্বপ্ন নয়"
                      />
                      <button 
                        onClick={handleSaveSettings}
                        className="bg-[#C9A84C] hover:bg-[#ba9633] text-[#0B2545] font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm select-none cursor-pointer"
                      >
                        সেভ করুন
                      </button>
                    </div>

                    {settingsSuccess && (
                      <div className="text-[10px] font-bold text-center text-emerald-700 bg-emerald-50 rounded p-1.5 border border-emerald-100">
                        ✓ সর্বাধুনিক স্লোগান সফলভাবে ডাটাবেজে আপডেট করা হয়েছে।
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Developer Company List Panel block */}
                <div className="bg-white rounded-lg border border-[#e2e6ef] overflow-hidden flex flex-col text-left">
                  <div className="border-b border-[#e2e6ef] px-4 py-3 flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold text-[#1a2a4a] uppercase tracking-wider">পার্টনার কোম্পানি</h3>
                    <button 
                      onClick={() => setActiveTab('companies')}
                      className="text-[10px] font-semibold text-indigo-650 hover:underline"
                    >
                      + কোম্পানি যোগ করুন
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {[
                      { short: 'বগ', name: 'বসুন্ধরা গ্রুপ', count: '৪৫টি প্রজেক্ট', color: 'bg-blue-100 text-blue-900' },
                      { short: 'ইহা', name: 'ইস্টার্ন হাউজিং', count: '৩২টি প্রজেক্ট', color: 'bg-emerald-100 text-emerald-900' },
                      { short: 'কনর', name: 'কনকর্ব রিয়েল এস্টেট', count: '২৮টি প্রজেক্ট', color: 'bg-amber-100 text-amber-900' },
                      { short: 'শেল', name: 'শেলটেক', count: '১৯টি প্রজেক্ট', color: 'bg-purple-100 text-purple-900' }
                    ].map((comp, idx) => (
                      <div key={idx} className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg font-bold text-[10px] flex items-center justify-center ${comp.color}`}>
                            {comp.short}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#1a2a4a]">{comp.name}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{comp.count}</div>
                          </div>
                        </div>

                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          সক্রিয়
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ACTIVE VIEW TAB 1: Complete properties listing & modifications (CRUD) */}
          {activeTab === 'properties' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4" id="properties-panel">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#0B2545] uppercase">প্রপার্টি ইনভেন্টরি তালিকা ({properties.length})</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">সবগুলো ফ্ল্যাট, হোম বা কমার্শিয়াল প্লট এডিট বা ডিলিট করুন সরাসরি।</p>
                </div>
                
                <button 
                  onClick={openNewPropertyForm}
                  className="bg-[#0B2545] hover:bg-[#122c4d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="h-4 w-4 text-[#C9A84C]" />
                  <span>নতুন প্রজেক্ট যোগ করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="bg-slate-50 border-b border-indigo-50 text-slate-500 font-bold">
                      <th className="px-4 py-3">ছবি</th>
                      <th className="px-4 py-3">শিরোনাম ও লোকেশন</th>
                      <th className="px-4 py-3">ক্যাটাগরি</th>
                      <th className="px-4 py-3">মূল্য ও সাইজ</th>
                      <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((p) => {
                      const cat = categories.find(c => c.id === p.categoryId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 shrink-0">
                            <img 
                              src={p.images[0]} 
                              alt="" 
                              className="h-10 w-16 object-cover rounded border border-slate-200 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#1a2a4a] text-xs truncate max-w-[200px]">{p.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{p.location}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {cat?.name || 'জমি'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#0B2545]">{p.price}</div>
                            <div className="text-[9px] text-slate-400 font-sans mt-0.5">{p.size} Sft / কাঠা</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.status === 'Sold Out' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => openEditPropertyForm(p)}
                                className="p-1.5 rounded bg-slate-100 hover:bg-[#C9A84C]/20 text-[#0B2545] transition"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProperty(p.id)}
                                className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ACTIVE VIEW TAB 2: Site Settings Panel */}
          {activeTab === 'settings' && (
            isSubAdmin ? (
              <div className="bg-gray-50 border border-slate-200 p-8 rounded-2xl text-center space-y-3" id="blocked-settings">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Lock className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700">সেটিংস পরিবর্তন করা অনুমোদিত নয়</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed font-sans">
                    সিস্টেমের গোপনীয়তা ও নিরাপত্তার স্বার্থে সাব-অ্যাডমিন ধরণে থাকা কোনো প্রশাসক এই পেজের কনফিগারেশন পরিবর্তন করতে পারবেন না। দয়া করে সুপার অ্যাডমিনের সাথে কন্টাক্ট করুন।
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5" id="settings-panel">
                <div>
                  <h3 className="text-sm font-semibold text-[#0B2545] uppercase">ওয়েবসাইট সেটিংস ও স্লোগান কন্ট্রোল</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">প্রধান ওয়েবসাইটের লোগো ব্র্যান্ডিং টেক্সট, টাইটেল স্লোগান, ব্যাকগ্রাউন্ড ইমেজ, কন্ট্যাক্ট নম্বর ও হেল্পলাইন কন্ট্রোল করার সেন্ট্রাল এডিটর।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">লোগো ব্র্যান্ডিং টেক্সট:</label>
                  <input
                    type="text"
                    value={localSettings.logoText}
                    onChange={(e) => setLocalSettings({ ...localSettings, logoText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অফিসিয়াল ইমেইল:</label>
                  <input
                    type="email"
                    value={localSettings.email}
                    onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">হেল্পলাইন কন্ট্যাক্ট নম্বর ( কল করুন ):</label>
                  <input
                    type="text"
                    value={localSettings.contactPhone}
                    onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-sans focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">হোয়াটসঅ্যাপ নম্বর (No Spaces, No + ):</label>
                  <input
                    type="text"
                    value={localSettings.contactWhatsapp}
                    onChange={(e) => setLocalSettings({ ...localSettings, contactWhatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-sans focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">ব্যানার বড় অফিশিয়াল স্লোগান:</label>
                  <textarea
                    rows={2}
                    value={localSettings.bannerTitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, bannerTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">ব্যানার সাব-সেকশন বিবরণ:</label>
                  <textarea
                    rows={2}
                    value={localSettings.bannerSubtitle}
                    onChange={(e) => setLocalSettings({ ...localSettings, bannerSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">পাদটীকা অফিস ঠিকানা (বাংলা):</label>
                  <input
                    type="text"
                    value={localSettings.officeAddress}
                    onChange={(e) => setLocalSettings({ ...localSettings, officeAddress: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#0B2545] focus:outline-none"
                  />
                </div>
              </div>

              {settingsSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-100 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>সাইট সেটিংস্ ডাটাবেজে সফলভাবে আপডেট হয়েছে।</span>
                </div>
              )}

              <button 
                onClick={handleSaveSettings}
                className="bg-[#0B2545] hover:bg-[#15345a] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <Save className="h-4 w-4 text-[#C9A84C]" />
                <span>সাইট সেটিংস পরিবর্তন সেভ করুন</span>
              </button>

            </div>
            )
          )}

          {/* ACTIVE VIEW TAB 3: Category/Project Controller */}
          {activeTab === 'categories' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5" id="categories-panel">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2545] uppercase">প্রজেক্ট ক্যাটাগরি ম্যানেজার</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ওয়েবসাইটের নতুন প্রজেক্ট ক্যাটাগরি টাইপ (যেমন- কমার্শিয়াল স্পেস, ফ্ল্যাট, ডুপ্লেক্স ভিলা বা প্লট) যোগ করুন এবং স্ল্যাগ সাজিয়ে নিন।</p>
              </div>

              {/* Error Alert */}
              {catError && (
                <div className="flex items-start space-x-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100 font-sans" id="cat-error-alert">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{catError}</span>
                </div>
              )}

              {/* Success Alert */}
              {catSuccess && (
                <div className="flex items-start space-x-1.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-sans" id="cat-success-alert">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{catSuccess}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি বাংলা নাম:</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white text-black rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                    placeholder="যেমন: ডুপ্লেক্স ভিলা"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Slug বা ইউনিক কোড (ইংরেজি):</label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-white text-black rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none font-mono placeholder-slate-400 font-medium"
                    placeholder="যেমন: duplex-villa"
                  />
                </div>

                <button 
                  onClick={handleAddCategory}
                  className="bg-[#0B2545] hover:bg-[#142e4e] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span>{editingCatId ? 'তথ্য আপডেট করুন' : 'নতুন টাইপ যোগ করুন'}</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="bg-slate-50 border-b border-indigo-50 font-bold text-slate-500">
                      <th className="px-4 py-3">ক্যাটাগরি কোড</th>
                      <th className="px-4 py-3">ইউনিক টাইপ নাম (বাংলা)</th>
                      <th className="px-4 py-3">ইউআরএল স্ল্যাগ (English)</th>
                      <th className="px-4 py-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 font-medium">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-slate-450">{c.id}</td>
                        <td className="px-4 py-2.5 font-bold text-[#1a2a4a]">{c.name}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{c.slug}</td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditCategory(c)}
                              className="p-1 rounded bg-slate-100 hover:bg-[#C9A84C]/25 text-[#0B2545]"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              disabled={categories.length <= 1}
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ACTIVE VIEW TAB 4: Builder Partner list */}
          {activeTab === 'companies' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-5" id="companies-panel">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2545] uppercase">পার্টনার ডেভেলপার কোম্পানি ক্রুড</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ওয়েবসাইটের প্রজেক্ট ডেভেলপারের তালিকা সম্পাদন ও ব্র্যান্ড ভ্যালু সংযোজন।</p>
              </div>

              {/* Company Alerts */}
              {compError && (
                <div className="flex items-start space-x-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-100 font-sans" id="comp-error-alert">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{compError}</span>
                </div>
              )}

              {compSuccess && (
                <div className="flex items-start space-x-1.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-sans" id="comp-success-alert">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{compSuccess}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">কোম্পানির নাম (বাংলা):</label>
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="যেমন: শান্তা হোল্ডিংস"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">স্থাপিত বা প্রতিষ্ঠার সাল (বাংলা):</label>
                    <input
                      type="text"
                      value={newCompanyEstablished}
                      onChange={(e) => setNewCompanyEstablished(e.target.value)}
                      className="w-full bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="যেমন: ২০০৫"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">আপলোড কোম্পানি লোগো বা প্রতীক:</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* File Uploader */}
                      <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-amber-50/20 rounded-lg p-2 px-3 text-xs font-semibold text-slate-600 bg-white cursor-pointer transition">
                        <Upload className="h-3.5 w-3.5 text-slate-400" />
                        <span>লোগো ছবি আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCompanyLogoFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="hidden sm:inline text-xs text-slate-400 self-center">অথবা</span>
                      {/* Manual text input for Emoji or direct url */}
                      <input
                        type="text"
                        value={newCompanyLogo}
                        onChange={(e) => setNewCompanyLogo(e.target.value)}
                        className="flex-1 bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium font-sans animate-none"
                        placeholder="ইমোজি (উদা: 🏗️) বা ইমেজ লিংক"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5">
                    <div className="h-10 w-10 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl text-lg flex items-center justify-center shadow-inner overflow-hidden select-none">
                      {newCompanyLogo?.startsWith('http') || newCompanyLogo?.startsWith('data:') ? (
                        <img 
                          src={newCompanyLogo} 
                          alt="Preview" 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        newCompanyLogo || '🏢'
                      )}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">লোগো প্রিভিউ</div>
                      <button
                        type="button"
                        onClick={() => setNewCompanyLogo('🏢')}
                        className="text-[9px] text-[#0B2545] hover:underline font-bold mt-0.5 block"
                      >
                        ডিফল্ট রিসেট
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleAddCompany}
                    className="bg-[#0B2545] hover:bg-[#122e4e] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Plus className="h-4 w-4 text-[#C9A84C]" />
                    <span>সেভ কোম্পানি</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="companies-grid">
                {companies.map((comp) => (
                  <div key={comp.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl text-lg flex items-center justify-center shadow-inner overflow-hidden">
                        {comp.logoUrl?.startsWith('http') || comp.logoUrl?.startsWith('data:') ? (
                          <img 
                            src={comp.logoUrl} 
                            alt={comp.companyName} 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          comp.logoUrl || '🏢'
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1a2a4a]">{comp.companyName}</h4>
                        <p className="text-[10px] text-slate-450 mt-1">প্রতিষ্ঠিত: {comp.established} সাল | আইডি: {comp.id}</p>
                      </div>
                    </div>

                    <button 
                      disabled={companies.length <= 1}
                      onClick={() => handleDeleteCompany(comp.id)}
                      className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition disabled:opacity-30 self-center shrink-0"
                      title="মুছুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ACTIVE VIEW TAB 5: Total Lead Inquiries overview */}
          {activeTab === 'inquiries' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4" id="inquiries-leads-panel">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2545] uppercase">ইনকোয়ারী মনিটর ও কল লিস্ট ({inquiries.length})</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">গ্রাহকেরা যেসব ফ্ল্যাট ও জমির ব্যাপারে আগ্রহ দেখিয়েছেন তাদের তালিকা এবং বাজেট সীমানা।</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="bg-slate-50 border-b border-indigo-50 text-slate-500 font-bold">
                      <th className="px-4 py-3">অবস্থা</th>
                      <th className="px-4 py-3">গ্রাহক নাম</th>
                      <th className="px-4 py-3">আগ্রহের ধরণ</th>
                      <th className="px-4 py-3">প্রস্তাবিত বাজেট এলাকা</th>
                      <th className="px-4 py-3">কন্টাক্ট নম্বর</th>
                      <th className="px-4 py-3">সময়কাল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr 
                        key={inq.id} 
                        className={`hover:bg-slate-50/50 transition cursor-pointer ${inq.isNew ? 'font-bold' : ''}`}
                        onClick={() => handleToggleInquiryStatus(inq.id)}
                        title="ক্লিক করে রিড/আনরিড মার্ক করুন"
                      >
                        <td className="px-4 py-3 shrink-0">
                          <span className={`inline-block h-2 w-2 rounded-full ${inq.isNew ? 'bg-red-500' : 'bg-slate-300'}`} />
                        </td>
                        <td className="px-4 py-3 text-[#1a2a4a] text-xs font-bold">
                          {inq.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            inq.tagClass === 'tag-flat' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 
                            inq.tagClass === 'tag-land' ? 'bg-[#FEF9EE] text-[#B45309]' : 
                            'bg-[#F0FDF4] text-[#166534]'
                          }`}>
                            {inq.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {inq.location} · বাজেট {inq.budget}
                        </td>
                        <td className="px-4 py-3 text-[#0B2545] font-sans font-semibold">
                          📞 {inq.phone}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-sans text-[10px]">
                          {inq.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW TAB 6: Sub-Admins list and invite controls */}
          {activeTab === 'subadmins' && (
            <div className="space-y-6" id="subadmins-control-panel">
              
              {/* Alert Message */}
              {subAdminSuccess && (
                <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-4 rounded-xl font-sans">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">সফল হয়েছে!</span>
                    <p className="mt-0.5">{subAdminSuccess}</p>
                  </div>
                </div>
              )}

              {subAdminError && (
                <div className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-100 p-4 rounded-xl font-sans">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">ত্রুটি ঘটেছে:</span>
                    <p className="mt-0.5">{subAdminError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                
                {/* Left hand side: Sub Admin Invitation Form (2 columns wide) */}
                <div className="xl:col-span-2 space-y-4">
                  {isSubAdmin ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left h-full flex flex-col justify-center items-center text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Lock className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">আমন্ত্রণ অপশন লকড</h4>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] font-sans">
                          আপনার অ্যাকাউন্টটি সাব-অ্যাডমিন রোলে রয়েছে। সিস্টেম সিকিউরিটি বজায় রাখার স্বার্থে কেবল সুপার অ্যাডমিন নতুন সাব-অ্যাডমিনদের যুক্ত করার ক্ষমতা রাখেন।
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[#0B2545] uppercase">নতুন সাব-অ্যাডমিন যুক্ত করুন</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans">নতুন প্রশাসনের জন্য বিবরণ প্রদান করুন। তাকে ইমেইল ও পাসওয়ার্ড প্রদান করলে তিনি সরাসরি ড্যাশবোর্ডে অ্যাক্সেস পাবেন।</p>
                      </div>

                      <form onSubmit={handleAddSubAdmin} className="space-y-3 font-sans">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">পূর্ণ নাম (বাংলা বা ইংরেজি):</label>
                          <input
                            type="text"
                            value={subAdminName}
                            onChange={(e) => setSubAdminName(e.target.value)}
                            className="w-full bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                            placeholder="উদা: কামাল হোসেন"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">প্রশাসক ইমেইল (Email):</label>
                          <input
                            type="email"
                            value={subAdminEmail}
                            onChange={(e) => setSubAdminEmail(e.target.value)}
                            className="w-full bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                            placeholder="example@astha.com"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">লগইন পাসওয়ার্ড/পিন (Password):</label>
                          <input
                            type="text"
                            value={subAdminPassword}
                            onChange={(e) => setSubAdminPassword(e.target.value)}
                            className="w-full bg-white text-black rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-[#0B2545] focus:outline-none placeholder-slate-400 font-medium"
                            placeholder="যেমন: SecPass99!"
                            required
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">লগইনে সফল হওয়ার পর সাব-অ্যাডমিন এই পিন কোড ও ড্যাশবোর্ডের সমস্ত সুবিধাদি ব্যবহার করতে পারবেন।</p>
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-[#0B2545] text-white hover:bg-[#13325a] py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Plus className="h-4 w-4 text-[#C9A84C]" />
                          <span>আমন্ত্রণ জানান ও অ্যাডমিন করুন</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Right hand side: Admins Registered List (3 columns wide) */}
                <div className="xl:col-span-3 bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B2545] uppercase">অ্যাডমিন ও সাব-অ্যাডমিন তালিকা ({registeredAdmins.length})</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">ড্যাশবোর্ড ব্যবহারের অনুমতি এবং সাইট অ্যাক্সেস সম্পন্ন সদস্যদের তথ্য তালিকা।</p>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs select-none">
                      <thead>
                        <tr className="bg-slate-50 border-b border-indigo-50 text-slate-550 font-bold font-sans">
                          <th className="px-4 py-3">পূর্ণ নাম</th>
                          <th className="px-4 py-3">ইমেইল ঠিকানা</th>
                          <th className="px-4 py-3 text-center">রোলের ধরণ</th>
                          <th className="px-4 py-3 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {registeredAdmins.map((admin) => {
                          const isThatSuper = admin.email.toLowerCase() === superAdminEmail.toLowerCase();
                          return (
                            <tr key={admin.email} className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3">
                                <span className="font-bold text-[#1a2a4a] block">{admin.name}</span>
                                {isThatSuper && <span className="text-[8px] bg-amber-50 text-amber-800 border-amber-100 border px-1 rounded inline-block mt-0.5">প্রধান মালিক</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-medium font-sans">{admin.email}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border font-sans ${
                                  isThatSuper 
                                    ? 'bg-amber-100 text-amber-950 border-amber-200' 
                                    : 'bg-indigo-50 text-indigo-905 border-indigo-100'
                                }`}>
                                  {isThatSuper ? '👑 Super Admin' : '🔒 Sub-Admin'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isThatSuper ? (
                                  <span className="text-[10px] text-slate-400 font-medium select-none font-sans">সুরক্ষিত</span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteSubAdmin(admin.email)}
                                    disabled={isSubAdmin}
                                    title={isSubAdmin ? 'সাব-অ্যাডমিনরা রোল মুছতে পারেন না' : 'রোল সরান'}
                                    className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition disabled:opacity-40 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

              {/* Sub Admin Constraints description guide block */}
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-left space-y-1.5">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-[#C9A84C]" />
                  <span>গুরুত্বপূর্ণ তথ্য এবং সাব-অ্যাডমিন নীতিমালা:</span>
                </h4>
                <ul className="list-disc pl-4.5 text-[10px] text-amber-950/85 space-y-1 leading-relaxed font-medium font-sans">
                  <li><strong>সুপার অ্যাডমিন ক্ষমতা:</strong> আপনি হলেন এই রিয়েল এস্টেট ওয়েবসাইটের মূল সুপার অ্যাডমিন (মালিক)। কেবল আপনার নিকট প্রধান সেটিংস অ্যাক্সেস থাকবে।</li>
                  <li><strong>সাব-অ্যাডমিনদের সীমাবদ্ধতা:</strong> আপনার দ্বারা আমন্ত্রিত সাব-অ্যাডমিন ড্যাশবোর্ডের সব কন্টেন্ট পরিবর্তন ও নতুন প্রজেক্ট অ্যাড করতে পারলেও তারা কোনো প্রজেক্ট <strong>মুছে ফেলতে (Delete)</strong> পারবে না, পার্টনার কোম্পানি <strong>বাদ দিতে</strong> পারবে না, এমনকি কোনো সাইট <strong>সেটিংস পেজে ঢুকতে বা সেটিংস পরিবর্তন</strong> করতে পারবে না।</li>
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* DETAILED MODAL FORM POPUP FOR SAVING / CREATING PROPERTIES */}
      {isPropertyFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4" id="property-modal-popup">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
            
            {/* Header Sticky Container */}
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B2545] font-sans">
                {editingProperty ? 'প্রপার্টি ইনভেন্টরি সংশোধন করুন' : 'নতুন প্রজেক্ট ডাটাবেজে যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsPropertyFormOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-200/50 hover:bg-slate-200/80 flex items-center justify-center text-slate-500 cursor-pointer focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrolling elements container list */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-705 text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">প্রকল্পের আকর্ষণীয় টাইটেল বা স্লোগান (বাংলা):</label>
                  <input
                    type="text"
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-sans font-medium text-slate-800"
                    placeholder="যেমন: সানরাইজ বিলাসবহুল ফ্ল্যাট ও বাগানবাড়ি"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ক্যাটাগরি বা টাইপ:</label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-white focus:outline-none font-bold text-slate-700"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ডেভেলপার বিল্ডার কোম্পানি:</label>
                  <select
                    value={propCompany}
                    onChange={(e) => setPropCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-white focus:outline-none font-bold text-slate-700"
                  >
                    {companies.map(comp => <option key={comp.id} value={comp.id}>{comp.companyName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">সঠিক ঠিকানা / লোকেশন (বাংলা):</label>
                  <input
                    type="text"
                    value={propLocation}
                    onChange={(e) => setPropLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-sans font-medium text-slate-800"
                    placeholder="যেমন- মিরপুর ১২, ঢাকা"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">প্রকল্প আনুমানিক মূল্য (যেমন- ৫৫ লাখ / কাস্টম BDT):</label>
                  <input
                    type="text"
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-sans font-medium text-slate-800"
                    placeholder="যেমন: ৳৫৫ লাখ"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">বাধ্যতামূলক জরুরী সংকেত বা ফেসিলিটি ট্যাগ:</label>
                  <input
                    type="text"
                    value={propStatus}
                    onChange={(e) => setPropStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-sans font-medium text-slate-800"
                    placeholder="যেমন- Available, Sold Out, রাজউক প্ল্যান ভেরিফাইড"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">মোট সাইজ / পরিমাপ (Sft বা কাঠা সংখ্যায়):</label>
                  <input
                    type="number"
                    value={propSize}
                    onChange={(e) => setPropSize(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">বেডরুম বিবরণ (ফ্ল্যাট ক্যাটাগরির জন্য):</label>
                  <input
                    type="number"
                    value={propBedrooms}
                    onChange={(e) => setPropBedrooms(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">বাথরুম বিবরণ (ফ্ল্যাট ক্যাটাগরির জন্য):</label>
                  <input
                    type="number"
                    value={propBathrooms}
                    onChange={(e) => setPropBathrooms(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">দিক বিন্যাস বা ফেসিং বিবরণ (বাংলা):</label>
                  <input
                    type="text"
                    value={propFacing}
                    onChange={(e) => setPropFacing(e.target.value)}
                    className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] font-sans font-medium text-slate-800"
                    placeholder="দক্ষিণমুখী"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-slate-100 border border-slate-250 rounded-xl p-3 sm:col-span-2 select-none">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={propFeatured}
                    onChange={(e) => setPropFeatured(e.target.checked)}
                    className="h-4.5 w-4.5 accent-[#0B2545] cursor-pointer"
                  />
                  <label htmlFor="featured-checkbox" className="font-bold text-[#0B2545] cursor-pointer text-xs">
                    ★ হোম পেইজ প্রিমিয়াম শোকেসে হট প্রজেক্ট হিসেবে প্রদর্শন করুন
                  </label>
                </div>
              </div>

              {/* Media Upload Section (Up to 5 images + 1 video) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ImageIcon className="h-4 w-4 text-[#C9A84C]" />
                  <span>প্রকল্পের মিডিয়া কন্ট্রোলার (ছবি ও ভিডিও)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Up to 5 Images Upload */}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-semibold text-slate-600">প্রজেক্ট ছবি আপলোড (সর্বোচ্চ ৫টি ছবি):</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-amber-50/20 rounded-xl p-3 text-xs font-semibold text-slate-600 bg-white cursor-pointer transition">
                        <Upload className="h-4 w-4 text-slate-400" />
                        <span>ডিভাইস থেকে ছবি নির্বাচন করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArr = Array.from(e.target.files) as File[];
                              const remainingCount = 5 - propImages.length;
                              if (remainingCount <= 0) {
                                alert('আপনি সর্বোচ্চ ৫টি ছবি আপলোড করতে পারবেন!');
                                return;
                              }
                              const targetFiles = filesArr.slice(0, remainingCount);

                              targetFiles.forEach((file) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setPropImages(prev => {
                                      if (prev.length < 5) {
                                        return [...prev, reader.result as string];
                                      }
                                      return prev;
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <div className="text-[10px] text-slate-400 font-sans leading-none">
                        ✓ সর্বোচ্চ ৫টি ছবি আপলোড করুন। ছবির ওপর মাউস নিয়ে (X) এ ক্লিক করে ডিলিট করতে পারবেন।
                      </div>
                    </div>

                    {/* Previews Grid */}
                    {propImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {propImages.map((img, i) => (
                          <div key={i} className="relative h-14 w-20 rounded-lg overflow-hidden border border-slate-300 group shadow-xs">
                            <img src={img} alt={`Preview ${i+1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                setPropImages(prev => prev.filter((_, idx) => idx !== i));
                              }}
                              className="absolute inset-0 bg-[#f43f5e]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold"
                              title="মুছে ফেলুন"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-1 rounded-tl leading-none">
                              {i+1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 1 Video Upload */}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-semibold text-slate-600">প্রজেক্ট ভিডিও আপলোড (১টি ভিডিও):</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-amber-50/20 rounded-xl p-3 text-xs font-semibold text-slate-600 bg-white cursor-pointer transition">
                        <Upload className="h-4 w-4 text-slate-400" />
                        <span>ডিভাইস থেকে ভিডিও নির্বাচন করুন</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setPropVideoUrl(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <div className="text-[10px] text-slate-400 font-sans leading-none">
                        ✓ ভিডিওটি প্রজেক্ট ডিটেইলসের সবার উপরে অটো-প্লে হবে।
                      </div>
                    </div>

                    {/* Video URL Fallback */}
                    <div>
                      <input
                        type="text"
                        value={propVideoUrl}
                        onChange={(e) => setPropVideoUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 text-[10px] bg-white font-mono text-slate-800 placeholder-slate-400 focus:outline-none"
                        placeholder="অথবা ভিডিওর সরাসরি ইউআরএল (URL) লিখন..."
                      />
                    </div>

                    {/* Video Preview */}
                    {propVideoUrl && (
                      <div className="relative border border-slate-200 bg-slate-100 rounded-lg p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <div className="h-9 w-12 bg-black rounded flex items-center justify-center text-white shrink-0">
                            <span className="text-[8px] font-sans">MP4</span>
                          </div>
                          <div className="truncate text-left leading-tight">
                            <span className="text-[9px] font-black text-slate-700 uppercase">সংযুক্ত ভিডিও</span>
                            <span className="text-[8px] block text-slate-400 truncate">{propVideoUrl.startsWith('data:') ? 'স্থানীয় ফাইল (Base64)' : propVideoUrl}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPropVideoUrl('')}
                          className="h-6 w-6 rounded bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors text-xs"
                          title="মুছে ফেলুন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">বিস্তারিত লিগ্যাল রিপোর্টিং বা আকর্ষণীয় ব্যাকগ্রাউন্ড বর্ণনা:</label>
                <textarea
                  rows={4}
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-350 p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B2545] text-slate-800 leading-relaxed font-sans"
                  placeholder="কাগজপত্র সম্পূর্ণ ঝামেলামুক্ত এবং বায়া দলিল চেইন আরএস রেকর্ড সহ আমাদের এক্সপার্ট টিম দিয়ে রাজউক ও ভূমি অফিসে যাচাইকৃত..."
                />
              </div>

            </div>

            {/* Actions sticky footer box */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsPropertyFormOpen(false)}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveProperty}
                className="rounded-xl bg-[#0B2545] hover:bg-[#122e4e] text-white px-5 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Save className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>প্রজেক্ট সেভ করুন</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
