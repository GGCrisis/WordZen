import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { API_ENDPOINTS, GAME_CONFIG, ERROR_MESSAGES } from '../../config';
import { apiRequest, audioUtils, handleError } from '../../utils';

interface PronunciationGameProps {
  language: string;
}

interface WordData {
  word: string;
  meaning: string;
}

interface PronunciationResponse {
  correct: boolean;
  feedback: string;
  recognized_text: string | null;
}

interface FeedbackContent {
  message: string;
  recognizedText?: string;
  additionalInfo?: string;
}

const PronunciationGame: React.FC<PronunciationGameProps> = ({ language }) => {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackContent | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<WordData>(API_ENDPOINTS.wordOfDay.get(language));
      setCurrentWord(data);
      setAttempts(0);
      setFeedback({
        message: 'Click the microphone to start recording'
      });
      setFeedbackType('info');
    } catch (error) {
      setFeedback({
        message: handleError(error)
      });
      setFeedbackType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewWord();
  }, [language]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, {
        mimeType: `${mimeType};codecs=opus`
      });

      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        await submitPronunciation(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setFeedback({ message: 'Recording... Speak now' });
      setFeedbackType('info');

      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, GAME_CONFIG.pronunciation.recordingDuration * 1000);
    } catch (error) {
      setFeedback({ message: ERROR_MESSAGES.audioError });
      setFeedbackType('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setFeedback({ message: 'Processing...' });
      setFeedbackType('info');
    }
  };

  const submitPronunciation = async (audioBlob: Blob) => {
    if (!currentWord) return;

    try {
      const audioData = await audioUtils.createAudioBlob(audioBlob);

      const response = await apiRequest<PronunciationResponse>(API_ENDPOINTS.pronunciation.check, {
        method: 'POST',
        body: {
          audio: audioData,
          word: currentWord.word,
          language,
        },
      });

      setAttempts(prev => prev + 1);

      if (response.correct) {
        setFeedback({
          message: response.feedback,
          recognizedText: response.recognized_text || undefined
        });
        setFeedbackType('success');
        setTimeout(fetchNewWord, 2500);
      } else {
        if (attempts + 1 >= GAME_CONFIG.pronunciation.attemptsPerWord) {
          setFeedback({
            message: response.feedback,
            recognizedText: response.recognized_text || undefined,
            additionalInfo: 'Moving to next word...'
          });
          setFeedbackType('error');
          setTimeout(fetchNewWord, 3000);
        } else {
          setFeedback({
            message: response.feedback,
            recognizedText: response.recognized_text || undefined,
            additionalInfo: `Attempts remaining: ${GAME_CONFIG.pronunciation.attemptsPerWord - (attempts + 1)}`
          });
          setFeedbackType('error');
        }
      }
    } catch (error) {
      setFeedback({ message: handleError(error) });
      setFeedbackType('error');
    }
  };

  const renderFeedback = (content: FeedbackContent): ReactNode => (
    <div>
      <p className="mb-2">{content.message}</p>
      {content.recognizedText && (
        <p className={`text-sm ${feedbackType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          Recognized: "{content.recognizedText}"
        </p>
      )}
      {content.additionalInfo && (
        <p className="mt-2 font-medium">{content.additionalInfo}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Pronunciation Practice</h2>
          <p className="opacity-90">Perfect your pronunciation skills</p>
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
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <span className="text-3xl text-white">
                  {isRecording ? '⬛' : '🎤'}
                </span>
              </button>

              {feedback && (
                <div
                  className={`p-4 rounded-lg text-center w-full ${
                    feedbackType === 'success'
                      ? 'bg-green-100 text-green-700'
                      : feedbackType === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {renderFeedback(feedback)}
                </div>
              )}

              <div className="flex justify-center space-x-2">
                {Array.from({ length: GAME_CONFIG.pronunciation.attemptsPerWord }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < attempts ? 'bg-red-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No words available for this language
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4">
          <button onClick={fetchNewWord} className="w-full btn-secondary">
            Skip to Next Word
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Click the microphone button to start recording</li>
          <li>Clearly pronounce the displayed word</li>
          <li>Click again to stop recording (or wait for auto-stop)</li>
          <li>Receive feedback on your pronunciation</li>
          <li>You have {GAME_CONFIG.pronunciation.attemptsPerWord} attempts per word</li>
        </ul>
      </div>
    </div>
  );
};

// No changes needed below, just ensure you are NOT using any custom Record<> type for GAME_CONFIG

export default PronunciationGame;
