// API Configuration
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Language endpoints
  languages: `${API_BASE_URL}/api/languages`,
  
  // Game endpoints
  speedGame: {
    start: (language: string) => `${API_BASE_URL}/api/speed-game/start/${language}`,
    check: `${API_BASE_URL}/api/speed-game/check`,
    nextSet: `${API_BASE_URL}/api/speed-game/next-set`,
  },
  pronunciation: {
    check: `${API_BASE_URL}/api/check-pronunciation`,
  },
  flashcard: {
    get: (language: string) => `${API_BASE_URL}/api/flashcard/${language}`,
  },
  wordOfDay: {
    get: (language: string) => `${API_BASE_URL}/api/word-of-day/${language}`,
  },
  multipleChoice: {
    get: (language: string) => `${API_BASE_URL}/api/multiple-choice/${language}`,
  },
  wordScramble: {
    get: (language: string) => `${API_BASE_URL}/api/scramble/${language}`,
  },
  leaderboard: {
    get: (gameType: string) => `${API_BASE_URL}/api/leaderboard/${gameType}`,
    update: (gameType: string) => `${API_BASE_URL}/api/leaderboard/${gameType}`,
  },
};

// Game Configuration
export const GAME_CONFIG = {
  speedGame: {
    duration: 120, // seconds
    wordsPerRound: 5,
    pointsPerCorrect: 10,
  },
  multipleChoice: {
    duration: 120, // seconds
    pointsPerCorrect: 10,
    choices: 4,
  },
  pronunciation: {
    attemptsPerWord: 3,
    recordingDuration: 5, // seconds
  },
  wordScramble: {
    pointsPerCorrect: 15,
    streakBonus: 5,
  },
};

// Supported Languages
export const SUPPORTED_LANGUAGES = ['english', 'telugu', 'sanskrit', 'kannada'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

// Animation Durations (in ms)
export const ANIMATIONS = {
  cardFlip: 600,
  fadeIn: 500,
  slideUp: 500,
  transition: 300,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  lastWordOfDay: 'wordzen_last_word',
  knownWords: 'wordzen_known_words',
  playerName: 'wordzen_player_name',
  selectedLanguage: 'wordzen_selected_language',
};

// Error Messages
export const ERROR_MESSAGES = {
  fetchError: 'Failed to fetch data. Please try again.',
  connectionError: 'Unable to connect to server. Please check your connection.',
  audioError: 'Unable to access microphone. Please check your permissions.',
  invalidInput: 'Invalid input. Please try again.',
  unauthorized: 'Please sign in to continue.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  pronunciationCorrect: 'Excellent pronunciation! 🎉',
  wordLearned: 'Word marked as learned! 📚',
  scoreSubmitted: 'Score submitted successfully! 🏆',
};

// Default Values
export const DEFAULTS = {
  language: 'english' as Language,
  loadingTimeout: 10000, // 10 seconds
  retryAttempts: 3,
  leaderboardLimit: 10,
};

// Feature Flags
export const FEATURES = {
  enablePronunciation: true,
  enableLeaderboard: true,
  enableWordOfDay: true,
  enableDebugMode: process.env.NODE_ENV === 'development',
};

// API Types
export type ApiHeaders = Record<string, string>;

// API Request Configuration
export const API_CONFIG = {
  timeout: 5000,
  retryCount: 3,
  headers: {
    'Content-Type': 'application/json'
  } satisfies ApiHeaders,
};

// Export all configurations
export default {
  API_ENDPOINTS,
  GAME_CONFIG,
  SUPPORTED_LANGUAGES,
  ANIMATIONS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
  FEATURES,
  API_CONFIG,
};