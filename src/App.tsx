import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

// Components
const Home = React.lazy(() => import('./components/Home'));
const SpeedGame = React.lazy(() => import('./components/games/SpeedGame'));
const FlashcardGame = React.lazy(() => import('./components/games/FlashcardGame'));
const WordOfDay = React.lazy(() => import('./components/games/WordOfDay'));
const MultipleChoice = React.lazy(() => import('./components/games/MultipleChoice'));
const WordScramble = React.lazy(() => import('./components/games/WordScramble'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));

// Types
type Language = 'english' | 'telugu' | 'sanskrit' | 'kannada';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const languages: Language[] = ['english', 'telugu', 'sanskrit', 'kannada'];

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <nav className="bg-white shadow-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="flex items-center space-x-3 transition-colors hover:text-blue-600"
                >
                  <span className="text-2xl">🎮</span>
                  <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    WordZen
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer hover:bg-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">🏆</span>
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <React.Suspense 
          fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/speed-game" 
              element={<SpeedGame language={selectedLanguage} />} 
            />
            <Route 
              path="/flashcards" 
              element={<FlashcardGame language={selectedLanguage} />} 
            />
            <Route 
              path="/word-of-day" 
              element={<WordOfDay language={selectedLanguage} />} 
            />
            <Route 
              path="/multiple-choice" 
              element={<MultipleChoice language={selectedLanguage} />} 
            />
            <Route 
              path="/word-scramble" 
              element={<WordScramble language={selectedLanguage} />} 
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </React.Suspense>
      </div>
    </Router>
  );
}

export default App;