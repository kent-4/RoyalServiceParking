export function validateRequiredFields(values, fields) {
  return fields.filter((field) => !values[field]);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isAtLeastAge(dateValue, minimumAge) {
  if (!dateValue) {
    return false;
  }

  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.valueOf())) {
    return false;
  }

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
  }

  return years >= minimumAge;
}

export function getPasswordStrength(password) {
  if (!password) {
    return 0;
  }

  let score = 0;

  if (password.length >= 6) {
    score += 20;
  }

  if (password.length >= 8) {
    score += 20;
  }

  if (/[A-Z]/.test(password)) {
    score += 20;
  }

  if (/[0-9]/.test(password)) {
    score += 20;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 20;
  }

  return score;
}
