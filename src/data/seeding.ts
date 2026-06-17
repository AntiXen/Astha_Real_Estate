import { SiteSettings, Category, Company, Property } from '../types';

// Default images generated and hosted locally
export const APARTMENT_IMAGE = '/src/assets/images/luxury_apartment_1780514000088.png';
export const PLOT_IMAGE = '/src/assets/images/purbachal_plot_1780514015702.png';

// Fallback high-quality architectural property images
export const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800', // modern apartment interior
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', // elegant villa/condo
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', // high-end kitchen / living space
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'  // land/suburban house
];

export const defaultSettings: SiteSettings = {
  id: 'default',
  logoText: 'আস্থার ঠিকানা',
  bannerTitle: 'কষ্টের উপার্জনে সঠিক প্রপার্টি—ঝামেলাযুক্ত ও শতভাগ নিরাপদ বিনিয়োগের একমাত্র ঠিকানা।',
  bannerSubtitle: 'দেশের সেরা ডেভেলপারদের যাচাইকৃত প্রজেক্ট থেকে বেছে নিন আপনার পছন্দের জমি বা ফ্ল্যাট। আমরা আছি আপনার আস্থার পাহারাদার হয়ে।',
  bannerImage: APARTMENT_IMAGE,
  contactPhone: '+8801712345678',
  contactWhatsapp: '8801712345678', // No + for direct whatsapp links
  officeAddress: 'রোড ১১, গুলশান ২, ঢাকা-১২১২, বাংলাদেশ',
  email: 'info@assthartikana.com'
};

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'ফ্ল্যাট', slug: 'flat' },
  { id: 'cat-2', name: 'জমি / প্লট', slug: 'land' },
  { id: 'cat-3', name: 'কমার্শিয়াল', slug: 'commercial' },
  { id: 'cat-4', name: 'ভিলা / ডুপ্লেক্স', slug: 'villa' }
];

export const defaultCompanies: Company[] = [
  { id: 'comp-1', companyName: 'বসুন্ধরা গ্রুপ (Bashundhara Group)', logoUrl: '🏢', established: '১৯৮৭' },
  { id: 'comp-2', companyName: 'ইস্টার্ন হাউজিং (Eastern Housing)', logoUrl: '🏗️', established: '১৯৬৪' },
  { id: 'comp-3', companyName: 'কনকর্ড রিয়েল এস্টেট (Concord Group)', logoUrl: '🏠', established: '১৯৭৩' },
  { id: 'comp-4', companyName: 'শেলটেক (Sheltech)', logoUrl: '🌟', established: '১৯৮৮' },
  { id: 'comp-5', companyName: 'র‍্যাংগস প্রপার্টিজ (Rangs Properties)', logoUrl: '🌿', established: '১৯৯৬' }
];

export const defaultProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'সানরাইজ রেসিডেন্স',
    description: 'মিরপুর ১২ এর অত্যন্ত চমৎকার লোকেশনে আধুনিক সুযোগ-সুবিধা সম্বলিত লাক্সারি ফ্ল্যাট। সুপরিসর ৩ বেডরুম, সুসজ্জিত বাথরুম ও দৃষ্টিনন্দন বারান্দা সহ এখনই বসবাসের উপযোগী পরিবেশ। আইনের দিক থেকে শতভাগ নিষ্কণ্টক এবং সরাসরি এজেন্সির মাধ্যমে বুকিং সুবিধাযুক্ত।',
    price: '৳৫৫ লাখ',
    location: 'মিরপুর ১২, ঢাকা',
    categoryId: 'cat-1',
    companyId: 'comp-2',
    images: [APARTMENT_IMAGE, DEFAULT_IMAGES[0], DEFAULT_IMAGES[2]],
    isFeatured: true,
    status: 'Available',
    bedrooms: 3,
    bathrooms: 2,
    size: 1350,
    facing: 'দক্ষিণমুখী'
  },
  {
    id: 'prop-2',
    title: 'গ্রিন ভ্যালি কমার্শিয়াল',
    description: 'গুলশান ২ এর প্রাইম হার্ট এরিয়াতে সম্পূর্ণ রেডি-টু-মুভ কমার্শিয়াল অফিস স্পেস। হাই-স্পিড এলিভেটর, ২৪ ঘণ্টা ব্যাকআপ জেনারেটর এবং মাল্টিপল কর্পোরেট চেম্বারের সাথে আপনার স্টার্টআপ বা আইটি প্রতিষ্ঠানের সেরা ঠিকানা।',
    price: '৳১.২ কোটি',
    location: 'গুলশান ২, ঢাকা',
    categoryId: 'cat-3',
    companyId: 'comp-3',
    images: [DEFAULT_IMAGES[0], DEFAULT_IMAGES[2], DEFAULT_IMAGES[1]],
    isFeatured: true,
    status: 'Available',
    size: 800,
    facing: 'উত্তরমুখী'
  },
  {
    id: 'prop-3',
    title: 'পূর্বাচল হ্যাভেন',
    description: 'পূর্বাচল নিউ টাউনের চমৎকার লোকেশনে ৩ বা ৫ কাঠার আবাসিক প্লট। গ্যাস ও বিদ্যুৎ সরবরাহের সংযোগ সম্পন্ন, সীমানা প্রাচীর দিয়ে ঘেরা এবং সম্পূর্ণ নিষ্কণ্টক রাজউক অনুমোদিত ও ভেরিফাইড প্রজেক্ট।',
    price: '৳৩৫ লাখ প্রতি কাঠা',
    location: 'পূর্বাচল, ঢাকা',
    categoryId: 'cat-2',
    companyId: 'comp-1',
    images: [PLOT_IMAGE, DEFAULT_IMAGES[3]],
    isFeatured: true,
    status: 'Available',
    size: 3,
    facing: 'পূর্বমুখী'
  },
  {
    id: 'prop-4',
    title: 'এলিট কনকর্ড ভিলাস',
    description: 'ঢাকার সাভারের প্রাকৃতিক পরিবেশে একটি বিলাসবহুল ডুপ্লেক্স ভিলা প্রজেক্ট। নিজস্ব সুইমিং pool, লন এরিয়া এবং রাজকীয় লিভিং স্পেস সহ সম্পূর্ণ প্রাইভেট বিলাসবহুল পারিবারিক নিবাস।',
    price: '৳৪.৫ কোটি',
    location: 'সাভার, ঢাকা',
    categoryId: 'cat-4',
    companyId: 'comp-3',
    images: [DEFAULT_IMAGES[1], DEFAULT_IMAGES[3]],
    isFeatured: false,
    status: 'Available',
    bedrooms: 5,
    bathrooms: 6,
    size: 5500,
    facing: 'দক্ষিণ-পশ্চিমমুখী'
  }
];
