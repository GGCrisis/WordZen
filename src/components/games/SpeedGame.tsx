import React, { useState, useEffect, useCallback } from 'react';

interface SpeedGameProps {
  language: string;
}

interface GameState {
  gameId: string | null;
  words: string[];
  meanings: string[];
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  selectedWord: string | null;
  selectedMeaning: string | null;
}

const SpeedGame: React.FC<SpeedGameProps> = ({ language }) => {
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    words: [],
    meanings: [],
    score: 0,
    timeLeft: 120, // 2 minutes in seconds
    isGameActive: false,
    selectedWord: null,
    selectedMeaning: null,
  });

  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const startGame = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/speed-game/start/${language}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGameState({
        ...gameState,
        gameId: data.game_id,
        words: data.words,
        meanings: data.meanings,
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

  const checkMatch = useCallback(async () => {
    if (!gameState.selectedWord || !gameState.selectedMeaning || !gameState.gameId) return;

    try {
      const response = await fetch('http://localhost:5000/api/speed-game/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameState.gameId,
          word: gameState.selectedWord,
          meaning: gameState.selectedMeaning,
        }),
      });

      const data = await response.json();

      if (data.correct) {
        setGameState(prev => ({
          ...prev,
          score: data.score,
          words: prev.words.filter(w => w !== prev.selectedWord),
          meanings: prev.meanings.filter(m => m !== prev.selectedMeaning),
          selectedWord: null,
          selectedMeaning: null,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          selectedWord: null,
          selectedMeaning: null,
        }));
      }
    } catch (error) {
      console.error('Error checking match:', error);
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
      setShowNameInput(true);
      setGameState(prev => ({ ...prev, isGameActive: false }));
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isGameActive, gameState.timeLeft]);

  const submitScore = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      await fetch('http://localhost:5000/api/leaderboard/speed_game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: playerName,
          score: gameState.score,
        }),
      });

      setShowNameInput(false);
      setPlayerName('');
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showNameInput) {
    return (
      <div className="flex flex-col items-center space-y-4 p-4">
        <h2 className="text-2xl font-bold">Game Over!</h2>
        <p className="text-xl">Your Score: {gameState.score}</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="border p-2 rounded"
        />
        <button
          onClick={submitScore}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Score
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Speed Game</h2>
        <div className="flex space-x-4">
          <span className="text-xl">Score: {gameState.score}</span>
          <span className="text-xl">Time: {formatTime(gameState.timeLeft)}</span>
        </div>
      </div>

      {!gameState.isGameActive ? (
        <button
          onClick={startGame}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Start Game
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold mb-2">Words</h3>
            {gameState.words.map((word) => (
              <button
                key={word}
                onClick={() => setGameState(prev => ({ ...prev, selectedWord: word }))}
                className={`w-full p-2 rounded ${
                  gameState.selectedWord === word
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold mb-2">Meanings</h3>
            {gameState.meanings.map((meaning) => (
              <button
                key={meaning}
                onClick={() => setGameState(prev => ({ ...prev, selectedMeaning: meaning }))}
                className={`w-full p-2 rounded ${
                  gameState.selectedMeaning === meaning
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {meaning}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedGame;