"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePrice = normalizePrice;
exports.isValidPrice = isValidPrice;
/**
 * Normalizes Costa Rican currency formatting to JavaScript numbers
 * Handles various formats:
 * - "3.000.00" (dot as thousands separator)
 * - "1,500.00" (comma as thousands separator)
 * - "44,800 " (trailing spaces)
 * - "2800" (no separators)
 */
function normalizePrice(priceString) {
    if (!priceString)
        return 0;
    // Remove all whitespace
    let cleaned = priceString.trim();
    // Remove currency symbols if present
    cleaned = cleaned.replace(/[₡$]/g, '');
    // Count dots and commas to determine format
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;
    // Determine if we have a decimal point
    let result;
    if (dotCount > 1) {
        // Format: "3.000.00" - dots are thousands separators
        // Remove all dots except potentially the last one if it's followed by exactly 2 digits
        const lastDotIndex = cleaned.lastIndexOf('.');
        const afterLastDot = cleaned.substring(lastDotIndex + 1);
        if (afterLastDot.length === 2) {
            // Last dot is decimal separator
            result = cleaned.replace(/\./g, (match, offset) => offset === lastDotIndex ? '.' : '');
        }
        else {
            // All dots are thousands separators
            result = cleaned.replace(/\./g, '');
        }
    }
    else if (commaCount > 1) {
        // Format: "1,000,000.00" - commas are thousands separators
        result = cleaned.replace(/,/g, '');
    }
    else if (dotCount === 1 && commaCount === 1) {
        // Mixed format - determine which is decimal
        const dotIndex = cleaned.indexOf('.');
        const commaIndex = cleaned.indexOf(',');
        if (dotIndex > commaIndex) {
            // Comma is thousands: "1,500.00"
            result = cleaned.replace(',', '');
        }
        else {
            // Dot is thousands: "1.500,00"
            result = cleaned.replace('.', '').replace(',', '.');
        }
    }
    else if (dotCount === 1) {
        // Single dot - check if it's decimal or thousands
        const parts = cleaned.split('.');
        if (parts[1] && parts[1].length <= 2) {
            // Likely decimal: "1500.00"
            result = cleaned;
        }
        else {
            // Likely thousands: "1.500"
            result = cleaned.replace('.', '');
        }
    }
    else if (commaCount === 1) {
        // Single comma - check if it's decimal or thousands
        const parts = cleaned.split(',');
        if (parts[1] && parts[1].length <= 2) {
            // Likely decimal: "1500,00"
            result = cleaned.replace(',', '.');
        }
        else {
            // Likely thousands: "1,500"
            result = cleaned.replace(',', '');
        }
    }
    else {
        // No separators
        result = cleaned;
    }
    const parsed = parseFloat(result);
    return isNaN(parsed) ? 0 : parsed;
}
/**
 * Validates if a string looks like a price
 */
function isValidPrice(str) {
    if (!str)
        return false;
    const cleaned = str.trim().replace(/[₡$,.\s]/g, '');
    return /^\d+$/.test(cleaned);
}
