// Date formatting utility functions

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format type ('full', 'short', 'medium')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'medium') => {
    if (!date) return 'Not specified';
    
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }
    
    const options = {
        full: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        medium: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        },
        short: {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        }
    };
    
    try {
        return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date formatting error';
    }
};

/**
 * Format a date to show relative time (e.g., "2 days ago")
 * @param {Date|string} date - The date to format
 * @returns {string} - Relative time string
 */
const formatRelativeTime = (date) => {
    if (!date) return 'Unknown time';
    
    const dateObj = new Date(date);
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};

/**
 * Get the current timestamp in a readable format
 * @returns {string} - Current timestamp
 */
const getCurrentTimestamp = () => {
    return formatDate(new Date(), 'full');
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is today
 */
const isToday = (date) => {
    if (!date) return false;
    
    const dateObj = new Date(date);
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is this week
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is this week
 */
const isThisWeek = (date) => {
    if (!date) return false;
    
    const dateObj = new Date(date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return dateObj >= weekAgo && dateObj <= today;
};

/**
 * Format date for database storage (MySQL DATETIME format)
 * @param {Date} date - The date to format
 * @returns {string} - MySQL DATETIME formatted string
 */
const formatForDatabase = (date = new Date()) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Parse database date string to Date object
 * @param {string} dateString - MySQL DATETIME string
 * @returns {Date} - Date object
 */
const parseFromDatabase = (dateString) => {
    if (!dateString) return null;
    
    // Handle MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
    const formattedString = dateString.replace(' ', 'T') + 'Z';
    return new Date(formattedString);
};

module.exports = {
    formatDate,
    formatRelativeTime,
    getCurrentTimestamp,
    isToday,
    isThisWeek,
    formatForDatabase,
    parseFromDatabase
};
