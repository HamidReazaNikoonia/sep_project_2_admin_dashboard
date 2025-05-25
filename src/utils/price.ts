/**
 * Formats a number as a price in Persian/Farsi format
 * @param price - Number to format as price
 * @param withCurrency - Whether to append the currency label (default: true)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, withCurrency: boolean = true): string => {
    // Convert number to Persian digits and add comma separators
    const formattedNumber = new Intl.NumberFormat('fa-IR').format(price);
  
    // Return with or without currency label
    return withCurrency ? `${formattedNumber} تومان` : formattedNumber;
  };
  
  /**
   * Formats a number as a price in Persian/Farsi format with shorter currency
   * @param price - Number to format as price
   * @returns Formatted price string with shorter currency
   */
  export const formatPriceShort = (price: number): string => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${new Intl.NumberFormat('fa-IR').format(millions)} میلیون تومان`;
    }
    return formatPrice(price);
  };