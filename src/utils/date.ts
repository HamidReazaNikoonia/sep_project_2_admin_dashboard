import moment from 'moment-jalaali';

/**
 * Formats a date string to Jalali format
 * @param date - ISO date string or MongoDB date
 * @returns Formatted Jalali date string
 */
export const formatDate = (date: string): string => {
  return moment(date).format('jYYYY/jMM/jDD HH:mm');
};

// If you need more specific formats, you can create variations:
export const formatDateShort = (date: string): string => {
  return moment(date).format('jYYYY/jMM/jDD');
};

export const formatDateLong = (date: string): string => {
  return moment(date).format('dddd jD jMMMM jYYYY - HH:mm');
};

export const formatDateRelative = (date: string): string => {
  const now = moment();
  const dateObj = moment(date);
  const diffDays = now.diff(dateObj, 'days');

  if (diffDays === 0) {
    return 'امروز ' + dateObj.format('HH:mm');
  } else if (diffDays === 1) {
    return 'دیروز ' + dateObj.format('HH:mm');
  } else if (diffDays <= 7) {
    return diffDays + ' روز پیش';
  } else {
    return dateObj.format('jYYYY/jMM/jDD');
  }
};