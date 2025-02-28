import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, GAME_CONFIG } from '../../config';
import { apiRequest, handleError } from '../../utils';

interface PronunciationGameProps {
  language: string;
}

interface WordData {
  word: string;
  meaning: string;
}

// Web Speech API types
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

// Define the constructor
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

const PronunciationGame: React.FC<PronunciationGameProps> = ({ language }) => {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string>('Click the microphone to start');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Language code mapping
  const getLanguageCode = (lang: string): string => {
    const languageCodes: { [key: string]: string } = {
      english: 'en-US',
      telugu: 'te-IN',
      kannada: 'kn-IN',
      sanskrit: 'sa-IN'
    };
    return languageCodes[lang] || 'en-US';
  };

  const recognition = useRef<ISpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis>(window.speechSynthesis);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = getLanguageCode(language);

      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        if (event.results[event.results.length - 1].isFinal) {
          checkPronunciation(transcript, confidence);
          recognition.current?.stop();
        } else {
          setFeedback('Listening...');
        }
      };

      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setFeedback(`Error: ${event.error}. Please try again.`);
        setIsListening(false);
      };

      recognition.current.onstart = () => {
        setFeedback('Listening... Speak now!');
        setIsListening(true);
      };

      recognition.current.onend = () => {
        setIsListening(false);
        if (!currentWord) return;
        
        // If we haven't received a result yet, prompt the user to try again
        if (feedback === 'Listening... Speak now!') {
          setFeedback('No speech detected. Please try again.');
        }
      };
    } else {
      setFeedback('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
      synthesis.current.cancel();
    };
  }, [language]);

  useEffect(() => {
    fetchNewWord();
  }, [language]);

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<WordData>(API_ENDPOINTS.wordOfDay.get(language));
      setCurrentWord(data);
      setFeedback('Click the microphone to start speaking');
    } catch (error) {
      setFeedback(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const speakWord = () => {
    if (!currentWord) return;

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = getLanguageCode(language);
    synthesis.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition.current) {
      setFeedback('Speech recognition is not supported in your browser');
      return;
    }

    try {
      if (isListening) {
        recognition.current.stop();
      } else {
        // Reset feedback before starting
        setFeedback('Starting...');
        recognition.current.start();
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setFeedback('Error starting speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const checkPronunciation = (transcript: string, confidence: number) => {
    if (!currentWord) return;

    const word = currentWord.word.toLowerCase();
    const similarity = calculateSimilarity(word, transcript);
    const confidenceScore = confidence * 100;
    
    // For non-English languages, be more lenient with the similarity threshold
    const isNonEnglish = language !== 'english';
    const similarityThreshold = isNonEnglish ? 0.2 : 0.3; // Very lenient threshold
    
    console.log('Pronunciation check:', {
      said: transcript,
      expected: word,
      similarity,
      threshold: similarityThreshold,
      language,
      confidence: confidenceScore
    });
    
    if (similarity >= similarityThreshold) {
      setScore(prev => prev + 1);
      setFeedback(`Good! Moving to next word...`);
      fetchNewWord();
    } else {
      setFeedback(
        `Try again! You said "${transcript}". Click 🔊 to hear "${word}".`
      );
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">AI Pronunciation Trainer</h2>
          <p className="opacity-90">Perfect your pronunciation with real-time AI feedback</p>
          <div className="mt-2 text-xl">Score: {score}</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner h-12 w-12" />
          </div>
        ) : currentWord ? (
          <div className="p-6">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold mb-4">{currentWord.word}</h3>
              <p className="text-gray-600">{currentWord.meaning}</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="flex space-x-4">
                <button
                  onClick={speakWord}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all"
                >
                  <span className="text-2xl text-white">🔊</span>
                </button>

                <button
                  onClick={toggleListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <span className="text-2xl text-white">
                    {isListening ? '⬛' : '🎤'}
                  </span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-gray-100 text-center w-full">
                <p className="text-gray-700">{feedback}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No words available for this language
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4">
          <button
            onClick={fetchNewWord}
            className="w-full btn-secondary"
          >
            Skip to Next Word
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Click the speaker icon to hear the correct pronunciation</li>
          <li>Click the microphone button and speak the word clearly</li>
          <li>Get real-time AI feedback on your pronunciation</li>
          <li>Practice until you achieve a perfect score!</li>
        </ul>
      </div>
    </div>
  );
};

export default PronunciationGame;