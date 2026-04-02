// Format phone number to Brazilian format: (xx) x xxxx-xxxx
export function formatWhatsApp(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits (Brazilian mobile with area code)
  const limited = digits.slice(0, 11);
  
  // Apply formatting based on length
  if (limited.length <= 2) {
    return limited.length ? `(${limited}` : '';
  } else if (limited.length <= 3) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3, 7)}-${limited.slice(7)}`;
  }
}

// Format an already stored phone number for display
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  
  // If already formatted, return as-is
  if (phone.includes('(') && phone.includes(')')) {
    return phone;
  }
  
  return formatWhatsApp(phone);
}
