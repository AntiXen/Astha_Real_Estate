/**
 * Hardened validation and sanitization utilities for Astha Real Estate.
 */

/**
 * Validates a Bangladeshi mobile phone number.
 * Supports formats: +88017XXXXXXXX, 88018XXXXXXXX, 019XXXXXXXX, 
 * as well as numbers separated by spaces or dashes.
 */
export function isValidBDPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s-]/g, ''); // strip spaces and dashes
  const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return bdPhoneRegex.test(cleanPhone);
}

/**
 * Normalizes a Bangladeshi phone number to a standard format (e.g., +88017XXXXXXXX)
 */
export function normalizeBDPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const match = cleanPhone.match(/^(?:\+88|88)?(01[3-9]\d{8})$/);
  if (match) {
    return `+88${match[1]}`;
  }
  return phone;
}

/**
 * Sanitizes user inputs to strip out HTML tags and prevent XSS script injections.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script[^>]*?>([\s\S]*?)<\/script>/gi, '') // strip scripts
    .replace(/<\/?[^>]+(>|$)/g, '') // strip HTML tags
    .trim();
}

/**
 * Validates standard email address formats.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates URL slugs (lowercase alphanumeric characters and hyphens only).
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Validates establishing years (supports 4 digits in English or Bengali).
 */
export function isValidEstablishedYear(year: string): boolean {
  const cleanYear = year.trim();
  const englishYearRegex = /^(19|20)\d{2}$/;
  
  // Bengali digit mapper
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  
  const mappedYear = cleanYear.split('').map(char => bnToEnMap[char] || char).join('');
  return englishYearRegex.test(mappedYear);
}