import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils';
import { API_ENDPOINTS } from '../../config';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface WordPair {
  word: string;
  meaning: string;
}

interface SpeedGameStartResponse {
  game_id: string;
  words: string[];
  meanings: string[];
}

interface SpeedGameCheckResponse {
  correct: boolean;
  score: number;
  needs_new_set?: boolean;
}

interface NextWordSetResponse {
  words: string[];
  meanings: string[];
}

interface SpeedGameProps {
  language: string;
}

interface GameState {
  gameId: string | null;
  wordPairs: WordPair[];
  displayedWords: string[];
  displayedMeanings: string[];
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  selectedWord: string | null;
  selectedMeaning: string | null;
}

const SpeedGame: React.FC<SpeedGameProps> = ({ language }) => {
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    wordPairs: [],
    displayedWords: [],
    displayedMeanings: [],
    score: 0,
    timeLeft: 120,
    isGameActive: false,
    selectedWord: null,
    selectedMeaning: null,
  });

  const navigate = useNavigate();
  const [showGameOver, setShowGameOver] = useState(false);
  const [displayName, setDisplayName] = useState(
    localStorage.getItem('lastUsedDisplayName') || ''
  );

  const startGame = async () => {
    try {
      const data = await apiRequest<SpeedGameStartResponse>(API_ENDPOINTS.speedGame.start(language), {
        method: 'POST',
        requiresAuth: false
      });

      // Create word pairs to maintain associations
      const pairs: WordPair[] = data.words.map((word, index) => ({
        word,
        meaning: data.meanings[index]
      }));

      setGameState({
        ...gameState,
        gameId: data.game_id,
        wordPairs: pairs,
        displayedWords: data.words,
        displayedMeanings: data.meanings,
        isGameActive: true,
        timeLeft: 120,
        score: 0,
        selectedWord: null,
        selectedMeaning: null,
      });
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const getNextWordSet = async () => {
    try {
      const data = await apiRequest<NextWordSetResponse>(API_ENDPOINTS.speedGame.nextSet, {
        method: 'POST',
        requiresAuth: false,
        body: {
          game_id: gameState.gameId,
        },
      });

      // Create new word pairs to maintain associations
      const pairs: WordPair[] = data.words.map((word, index) => ({
        word,
        meaning: data.meanings[index]
      }));

      setGameState(prev => ({
        ...prev,
        wordPairs: pairs,
        displayedWords: data.words,
        displayedMeanings: data.meanings,
        selectedWord: null,
        selectedMeaning: null,
      }));
    } catch (error) {
      console.error('Error getting next word set:', error);
    }
  };

  const checkMatch = useCallback(async () => {
    if (!gameState.selectedWord || !gameState.selectedMeaning || !gameState.gameId) return;

    try {
      const data = await apiRequest<SpeedGameCheckResponse>(API_ENDPOINTS.speedGame.check, {
        method: 'POST',
        requiresAuth: false,
        body: {
          game_id: gameState.gameId,
          word: gameState.selectedWord,
          meaning: gameState.selectedMeaning,
        },
      });

      if (data.correct) {
        // Remove the matched pair and update displays
        const newPairs = gameState.wordPairs.filter(pair => pair.word !== gameState.selectedWord);
        const newDisplayedWords = gameState.displayedWords.filter(w => w !== gameState.selectedWord);
        const newDisplayedMeanings = gameState.displayedMeanings.filter(m => m !== gameState.selectedMeaning);

        setGameState(prev => ({
          ...prev,
          score: data.score,
          wordPairs: newPairs,
          displayedWords: newDisplayedWords,
          displayedMeanings: newDisplayedMeanings,
          selectedWord: null,
          selectedMeaning: null,
        }));

        // If all words in current set are matched, get next set
        if (newPairs.length === 0) {
          getNextWordSet();
        }
      } else {
        // Wrong match, just clear selections
        setGameState(prev => ({
          ...prev,
          selectedWord: null,
          selectedMeaning: null,
        }));
      }
    } catch (error) {
      console.error('Error checking match:', error);
      // Clear selections on error
      setGameState(prev => ({
        ...prev,
        selectedWord: null,
        selectedMeaning: null,
      }));
    }
  }, [gameState.selectedWord, gameState.selectedMeaning, gameState.gameId]);

  useEffect(() => {
    if (gameState.selectedWord && gameState.selectedMeaning) {
      checkMatch();
    }
  }, [gameState.selectedWord, gameState.selectedMeaning, checkMatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isGameActive && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && gameState.isGameActive) {
      setShowGameOver(true);
      setGameState(prev => ({ ...prev, isGameActive: false }));
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isGameActive, gameState.timeLeft]);

  const submitScore = async () => {
    if (!auth.currentUser) {
      alert('Please log in to submit your score');
      navigate('/login');
      return;
    }

    try {
      if (!auth.currentUser?.uid) {
        throw new Error('Unauthorized');
      }

      if (!displayName.trim()) {
        alert('Please enter a display name');
        return;
      }

      // Save display name for future use
      localStorage.setItem('lastUsedDisplayName', displayName);

      await apiRequest(API_ENDPOINTS.leaderboard.update('speed_game'), {
        method: 'POST',
        requiresAuth: true,
        body: {
          player: `${auth.currentUser.uid}:${displayName}`,
          score: gameState.score,
        },
      });

      setShowGameOver(false);
      alert('Score submitted successfully!');
    } catch (error) {
      console.error('Error submitting score:', error);
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          alert('Please log in to submit your score');
          navigate('/login');
        } else if (error.message.includes('Invalid player identifier')) {
          // This shouldn't happen in normal flow, but handle it gracefully
          alert('Error validating player identity. Please try again.');
          setDisplayName(''); // Reset display name to force re-entry
        } else {
          alert('Failed to submit score. Please try again.');
        }
      } else {
        alert('Failed to submit score. Please try again.');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showGameOver) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-white">🎮</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Game Over!
          </h2>
          <div className="bg-indigo-100 px-8 py-4 rounded-lg mb-6">
            <p className="text-2xl font-bold text-indigo-700">Score: {gameState.score}</p>
          </div>
          {auth.currentUser ? (
            <div className="space-y-4 w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  maxLength={20}
                />
                <p className="mt-2 text-sm text-gray-600 text-center">
                  This name will be shown on the leaderboard
                </p>
              </div>
              <button
                onClick={submitScore}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Submit Score
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-red-500 mb-4">Please log in to save your score</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Speed Game
            </h2>
            <div className="flex space-x-6">
              <div className="bg-indigo-100 px-4 py-2 rounded-lg">
                <span className="text-lg font-semibold text-indigo-700">Score: {gameState.score}</span>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <span className="text-lg font-semibold text-purple-700">Time: {formatTime(gameState.timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {!gameState.isGameActive ? (
          <div className="flex flex-col items-center justify-center space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 text-center">Ready to Test Your Speed?</h3>
            <p className="text-gray-600 text-center max-w-md">
              Match words with their meanings as quickly as you can. The faster you match, the higher your score!
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">Words</h3>
              <div className="space-y-3">
                {gameState.displayedWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => setGameState(prev => ({ ...prev, selectedWord: word }))}
                    className={`w-full p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                      gameState.selectedWord === word
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-gray-800 hover:shadow-md'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">Meanings</h3>
              <div className="space-y-3">
                {gameState.displayedMeanings.map((meaning) => (
                  <button
                    key={meaning}
                    onClick={() => setGameState(prev => ({ ...prev, selectedMeaning: meaning }))}
                    className={`w-full p-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                      gameState.selectedMeaning === meaning
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-purple-50 hover:bg-purple-100 text-gray-800 hover:shadow-md'
                    }`}
                  >
                    {meaning}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedGame;