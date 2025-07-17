import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../config';
import { apiRequest, storage, dateUtils, handleError } from '../../utils';

interface WordOfDayProps {
  language: string;
}

interface WordData {
  word: string;
  meaning: string;
}

interface StoredWord extends WordData {
  date: string;
  language: string;
}

const WordOfDay: React.FC<WordOfDayProps> = ({ language }) => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredWord[]>([]);

  const fetchWordOfDay = async () => {
    setLoading(true);
    setError(null);

    // Check if we already have today's word
    const today = new Date();
    const storedWords = storage.get<StoredWord[]>(STORAGE_KEYS.lastWordOfDay, []);
    const todayWord = storedWords.find(
      word => word.language === language && dateUtils.isSameDay(new Date(word.date), today)
    );

    if (todayWord) {
      setWordData(todayWord);
      setHistory(storedWords);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<WordData>(API_ENDPOINTS.wordOfDay.get(language));
      
      const newWord: StoredWord = {
        ...data,
        date: today.toISOString(),
        language,
      };

      // Update storage with new word
      const updatedWords = [
        newWord,
        ...storedWords.filter(
          word => !(word.language === language && dateUtils.isSameDay(new Date(word.date), today))
        ),
      ].slice(0, 30); // Keep last 30 days

      storage.set(STORAGE_KEYS.lastWordOfDay, updatedWords);
      setWordData(data);
      setHistory(updatedWords);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWordOfDay();
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
          <button
            onClick={fetchWordOfDay}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {wordData && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Word of the Day</h2>
              <span className="text-sm opacity-75">
                {dateUtils.formatDate(new Date())}
              </span>
            </div>
            <p className="opacity-75">Expand your vocabulary one word at a time</p>
          </div>

          <div className="p-6">
            <div className="animate-fade-in">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-2">{wordData.word}</h3>
                <p className="text-gray-600">{wordData.meaning}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tips for Learning:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Try using this word in a sentence today</li>
                  <li>• Write it down in your vocabulary notebook</li>
                  <li>• Practice pronouncing it correctly</li>
                  <li>• Share it with a friend to help remember it</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Previous Words</h3>
          <div className="bg-white rounded-lg shadow-lg divide-y">
            {history
              .filter(word => word.language === language)
              .slice(1, 7) // Show last 6 days excluding today
              .map((word, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{word.word}</h4>
                      <p className="text-gray-600">{word.meaning}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {dateUtils.formatDate(new Date(word.date))}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">About Word of the Day:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>A new word is selected each day</li>
          <li>Words are saved for review</li>
          <li>Practice regularly to build your vocabulary</li>
          <li>Words are specific to your selected language</li>
        </ul>
      </div>
    </div>
  );
};

export default WordOfDay;