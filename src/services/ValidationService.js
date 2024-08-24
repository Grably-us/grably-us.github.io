// List of common disposable email domains
const disposableEmailDomains = [
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    // Add more as needed
  ];
  
  export function validateEmail(email) {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, reason: 'Invalid email format' };
    }
  
    // Check email length
    if (email.length < 5 || email.length > 255) {
      return { isValid: false, reason: 'Email length should be between 5 and 255 characters' };
    }
  
    // Check for disposable email domains
    const domain = email.split('@')[1].toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      return { isValid: false, reason: 'Disposable email addresses are not allowed' };
    }
  
    // Check for random-looking local parts
    const localPart = email.split('@')[0];
    if (localPart.length > 20 && !/^[a-zA-Z]+/.test(localPart)) {
      return { isValid: false, reason: 'Email address appears to be randomly generated' };
    }
  
    // Additional checks can be added here
  
    return { isValid: true };
  }