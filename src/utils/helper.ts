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

// Persian digits conversion
export const convertToPersianDigits = (text: string | number, options: { isPrice?: boolean } = {}) => {
  const { isPrice = false } = options;
  let textStr = text;
  if (typeof textStr === 'number') {
    textStr = textStr.toString();
  }
  
  // Add comma separator for prices
  if (options.isPrice) {
    textStr = textStr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ریال';
  }
  
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return textStr.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}



export const findFirstSession = (sessions: any) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Sort sessions by date in ascending order (earliest first)
  const sortedSessions = sessions.sort((a: any, b: any) => new Date(a.date) - new Date(b.date));

  // Return the first session (earliest date)
  return sortedSessions[0]?.date ?  formatDateShort(sortedSessions[0]?.date) : null;
};

/**
 * Convert array of objects to CSV and trigger download
 * @param data - Array of objects to convert to CSV
 * @param filename - Name of the CSV file (without extension)
 * @param headers - Optional custom headers mapping { key: 'Display Name' }
 */
export const downloadCSV = (
  data: any[],
  filename: string,
  headers?: Record<string, string>
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object or use custom headers
  const keys = Object.keys(data[0])
  const headerRow = headers
    ? keys.map((key) => headers[key] || key).join(',')
    : keys.join(',')

  // Convert data to CSV rows
  const csvRows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key]
        // Handle values that contain commas or quotes
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  )

  // Combine header and rows
  const csvContent = [headerRow, ...csvRows].join('\n')

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}