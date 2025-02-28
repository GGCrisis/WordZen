import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, GAME_CONFIG } from '../../config';
import { apiRequest, gameUtils, handleError } from '../../utils';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface MultipleChoiceProps {
  language: string;
}

interface Question {
  word: string;
  choices: string[];
  correct_index: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  isGameActive: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  questionsAnswered: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ language }) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_CONFIG.multipleChoice.duration,
    currentQuestion: null,
    selectedAnswer: null,
    isGameActive: false,
    showFeedback: false,
    isCorrect: false,
    questionsAnswered: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showGameOver, setShowGameOver] = useState(false);
  const [displayName, setDisplayName] = useState(
    localStorage.getItem('lastUsedDisplayName') || ''
  );

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Question>(
        API_ENDPOINTS.multipleChoice.get(language)
      );
      setGameState(prev => ({
        ...prev,
        currentQuestion: data,
        selectedAnswer: null,
        showFeedback: false,
      }));
      setError(null);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    setGameState({
      score: 0,
      timeLeft: GAME_CONFIG.multipleChoice.duration,
      currentQuestion: null,
      selectedAnswer: null,
      isGameActive: true,
      showFeedback: false,
      isCorrect: false,
      questionsAnswered: 0,
    });
    await fetchQuestion();
  };

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

      await apiRequest(API_ENDPOINTS.leaderboard.update('multiple_choice'), {
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

  const handleAnswer = (index: number) => {
    if (!gameState.isGameActive || gameState.selectedAnswer !== null) return;

    const isCorrect = index === gameState.currentQuestion?.correct_index;
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: index,
      showFeedback: true,
      isCorrect,
      score: isCorrect ? prev.score + GAME_CONFIG.multipleChoice.pointsPerCorrect : prev.score,
      questionsAnswered: prev.questionsAnswered + 1,
    }));

    setTimeout(() => {
      fetchQuestion();
    }, 1500);
  };

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
      setGameState(prev => ({ ...prev, isGameActive: false }));
      setShowGameOver(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isGameActive, gameState.timeLeft]);

  if (showGameOver) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <div className="mb-6">
            <p className="text-xl mb-2">Your Score: {gameState.score}</p>
            <p className="text-gray-600">
              Questions Answered: {gameState.questionsAnswered}
            </p>
          </div>
          {auth.currentUser ? (
            <div className="space-y-4 mb-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
              <p className="text-sm text-gray-600">
                This name will be shown on the leaderboard
              </p>
            </div>
          ) : (
            <p className="text-lg text-red-500 mb-4">Please log in to save your score</p>
          )}
          <button
            onClick={submitScore}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Submit Score
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Multiple Choice</h2>
            {gameState.isGameActive && (
              <div className="flex space-x-4 text-lg">
                <span>Score: {gameState.score}</span>
                <span>Time: {gameUtils.formatTime(gameState.timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {!gameState.isGameActive && !loading && !error ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Ready to Test Your Knowledge?</h3>
              <p className="text-gray-600 mb-6">
                You have {GAME_CONFIG.multipleChoice.duration} seconds to answer as many
                questions as you can. Each correct answer is worth{' '}
                {GAME_CONFIG.multipleChoice.pointsPerCorrect} points.
              </p>
              <button
                onClick={startGame}
                className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner h-12 w-12" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : gameState.currentQuestion ? (
            <div className="animate-fade-in">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {gameState.currentQuestion.word}
                </h3>
                <p className="text-gray-600">Select the correct meaning:</p>
              </div>

              <div className="space-y-3">
                {gameState.currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={gameState.selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                      gameState.selectedAnswer === null
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : gameState.showFeedback && gameState.currentQuestion
                        ? index === gameState.currentQuestion.correct_index
                          ? 'bg-green-100 text-green-800'
                          : gameState.selectedAnswer === index
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {gameState.showFeedback && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  gameState.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {gameState.isCorrect ? 'Correct! 🎉' : 'Wrong answer. Try the next one!'}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {!gameState.isGameActive && !showGameOver && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You have {GAME_CONFIG.multipleChoice.duration} seconds to play</li>
            <li>Select the correct meaning for each word</li>
            <li>Each correct answer is worth {GAME_CONFIG.multipleChoice.pointsPerCorrect} points</li>
            <li>Try to get on the leaderboard!</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;