import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, GAME_CONFIG } from '../../config';
import { apiRequest, handleError } from '../../utils';

interface WordScrambleProps {
  language: string;
}

interface ScrambledWord {
  original: string;
  scrambled: string;
  meaning: string;
}

const WordScramble: React.FC<WordScrambleProps> = ({ language }) => {
  const [currentWord, setCurrentWord] = useState<ScrambledWord | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ScrambledWord>(
        API_ENDPOINTS.wordScramble.get(language)
      );
      setCurrentWord(data);
      setUserInput('');
      setShowMeaning(false);
      setFeedback('Unscramble the letters to find the word');
      setFeedbackType('info');
    } catch (error) {
      setFeedback(handleError(error));
      setFeedbackType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewWord();
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord) return;

    const isCorrect = userInput.toLowerCase().trim() === currentWord.original.toLowerCase();

    if (isCorrect) {
      const streakBonus = streak * GAME_CONFIG.wordScramble.streakBonus;
      const points = GAME_CONFIG.wordScramble.pointsPerCorrect + streakBonus;
      
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setFeedback(`Correct! +${points} points (${streakBonus} streak bonus) 🎉`);
      setFeedbackType('success');
      
      setTimeout(() => {
        fetchNewWord();
      }, 1500);
    } else {
      setStreak(0);
      setFeedback('Try again! The letters can be rearranged to form a valid word.');
      setFeedbackType('error');
    }
  };

  const handleSkip = () => {
    if (!currentWord) return;
    setStreak(0);
    setFeedback(`The word was: ${currentWord.original}`);
    setFeedbackType('error');
    setTimeout(() => {
      fetchNewWord();
    }, 2000);
  };

  const handleHint = () => {
    setShowMeaning(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Word Scramble</h2>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Score: {score}</span>
              {streak > 0 && (
                <span className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full text-sm font-medium">
                  🔥 {streak} streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner h-12 w-12" />
            </div>
          ) : currentWord ? (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-4 tracking-wide">
                  {currentWord.scrambled.split('').map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block mx-1 bg-gray-100 rounded-lg px-3 py-2"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                {showMeaning && (
                  <p className="text-gray-600 mt-4">
                    Meaning: {currentWord.meaning}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Check Answer
                  </button>
                  <button
                    type="button"
                    onClick={handleHint}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Show Meaning
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </form>

              {feedback && (
                <div
                  className={`mt-6 p-4 rounded-lg text-center ${
                    feedbackType === 'success'
                      ? 'bg-green-100 text-green-800'
                      : feedbackType === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No words available for this language
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Unscramble the letters to form a valid word</li>
          <li>Each correct answer is worth {GAME_CONFIG.wordScramble.pointsPerCorrect} points</li>
          <li>Build a streak for bonus points!</li>
          <li>Use "Show Meaning" for a hint</li>
          <li>Skip if you're stuck</li>
        </ul>
      </div>

      {streak > 2 && (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-800">
            🔥 Amazing streak! Keep going for bigger bonuses!
          </p>
        </div>
      )}
    </div>
  );
};

export default WordScramble;