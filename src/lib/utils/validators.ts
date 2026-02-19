// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase
 * - At least one lowercase
 * - At least one number
 */
export function isStrongPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate donation amount
 */
export function isValidDonationAmount(amount: number): boolean {
  return amount >= 1 && amount <= 1000;
}

/**
 * Validate phone number (French format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string (remove XSS attempts)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file type
 */
export function isValidImageType(fileType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(fileType);
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number = 5): boolean {
  return fileSize <= maxSizeMB * 1024 * 1024;
}
