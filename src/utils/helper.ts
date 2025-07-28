import { formatDateShort } from "./date";

// Iranian National ID validation function
export const validateIranianNationalId = (nationalId: string) => {
  if (!nationalId || nationalId.length !== 10) {
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{9}$/.test(nationalId)) {
    return false;
  }

  // Calculate check digit
  let sum = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nationalId[i], 10) * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return parseInt(nationalId[9], 10) === checkDigit;
};


export const findFirstSession = (sessions: any) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Sort sessions by date in ascending order (earliest first)
  const sortedSessions = sessions.sort((a: any, b: any) => new Date(a.date) - new Date(b.date));

  // Return the first session (earliest date)
  return sortedSessions[0]?.date ?  formatDateShort(sortedSessions[0]?.date) : null;
};