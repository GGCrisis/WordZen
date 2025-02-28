import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../config';
import { apiRequest, storage, handleError } from '../../utils';

interface FlashcardGameProps {
  language: string;
}

interface FlashcardData {
  word: string;
  meaning: string;
}

interface KnownWords {
  [language: string]: Set<string>;
}

const FlashcardGame: React.FC<FlashcardGameProps> = ({ language }) => {
  const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knownWords, setKnownWords] = useState<KnownWords>(() => {
    const saved = storage.get<{ [key: string]: string[] }>(STORAGE_KEYS.knownWords, {});
    // Convert arrays to Sets
    return Object.entries(saved).reduce((acc, [lang, words]) => ({
      ...acc,
      [lang]: new Set(words)
    }), {});
  });

  const fetchNewCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<FlashcardData>(API_ENDPOINTS.flashcard.get(language));
      setCurrentCard(data);
      setIsFlipped(false);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewCard();
  }, [language]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnownClick = () => {
    if (!currentCard) return;

    setKnownWords(prev => {
      const updated = { ...prev };
      if (!updated[language]) {
        updated[language] = new Set();
      }
      updated[language].add(currentCard.word);

      // Save to localStorage
      const serializable = Object.entries(updated).reduce((acc, [lang, words]) => ({
        ...acc,
        [lang]: Array.from(words)
      }), {});
      storage.set(STORAGE_KEYS.knownWords, serializable);

      return updated;
    });

    fetchNewCard();
  };

  const getProgress = () => {
    const known = knownWords[language]?.size || 0;
    return known;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="text-gray-600">
          Known Words: {getProgress()}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner h-12 w-12" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
          <button
            onClick={fetchNewCard}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      ) : currentCard ? (
        <div className="mb-8">
          <div className="perspective">
            <div
              className={`flip relative bg-white rounded-xl shadow-lg cursor-pointer ${
                isFlipped ? 'flipped' : ''
              }`}
              onClick={handleCardClick}
              style={{ height: '300px' }}
            >
              <div className="flip-front absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden">
                <h3 className="text-3xl font-bold mb-4">{currentCard.word}</h3>
                <p className="text-gray-500">Click to reveal meaning</p>
              </div>
              <div className="flip-back absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden">
                <p className="text-xl text-center">{currentCard.meaning}</p>
                <p className="text-gray-500 mt-4">Click to see word</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => fetchNewCard()}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Don't Know
            </button>
            <button
              onClick={handleKnownClick}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Know It
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No flashcards available for this language
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Click the card to flip between word and meaning</li>
          <li>Select "Know It" if you're familiar with the word</li>
          <li>Select "Don't Know" to skip to the next word</li>
          <li>Your progress is saved automatically</li>
          <li>Practice regularly to build your vocabulary!</li>
        </ul>
      </div>

      {knownWords[language]?.size > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            Progress in {language.charAt(0).toUpperCase() + language.slice(1)}
          </h3>
          <p className="text-green-700">
            You've learned {knownWords[language].size} words in this language!
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardGame;