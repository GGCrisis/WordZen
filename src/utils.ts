import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from './config';
import type { Language } from './config';

// API Request Handler
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.fetchError);
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.connectionError);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ERROR_MESSAGES.fetchError);
  }
}

// Local Storage Helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Game Helpers
export const gameUtils = {
  shuffleArray: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  calculateScore: (correct: number, timeLeft: number, streak: number = 0): number => {
    const baseScore = correct * 10;
    const timeBonus = Math.floor(timeLeft / 10);
    const streakBonus = streak * 2;
    return baseScore + timeBonus + streakBonus;
  },

  formatTime: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
};


// Language Helpers
export const languageUtils = {
  getLanguageName: (code: Language): string => {
    return code.charAt(0).toUpperCase() + code.slice(1);
  },

  isRTL: (language: Language): boolean => {
    const rtlLanguages: Language[] = [];
    return rtlLanguages.includes(language);
  },
};

// Validation Helpers
export const validation = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUsername: (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
  },

  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
};

// Date Helpers
export const dateUtils = {
  isSameDay: (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  },
};

// Error Handling
export const handleError = (error: any): string => {
  console.error('Error:', error);
  if (error instanceof Error) {
    return error.message;
  }
  return ERROR_MESSAGES.fetchError;
};

export default {
  apiRequest,
  storage,
  gameUtils,
  languageUtils,
  validation,
  dateUtils,
  handleError,
};