import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Auth Components
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Components
const Home = React.lazy(() => import('./components/Home'));
const SpeedGame = React.lazy(() => import('./components/games/SpeedGame'));
const PronunciationGame = React.lazy(() => import('./components/games/PronunciationGame'));
const FlashcardGame = React.lazy(() => import('./components/games/FlashcardGame'));
const WordOfDay = React.lazy(() => import('./components/games/WordOfDay'));
const MultipleChoice = React.lazy(() => import('./components/games/MultipleChoice'));
const WordScramble = React.lazy(() => import('./components/games/WordScramble'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));

// Types
type Language = 'english' | 'telugu' | 'sanskrit' | 'kannada';

// Logout Button Component
const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
    >
      <span className="mr-2">👋</span>
      Logout
    </button>
  );
};

// Navigation Component
const Navigation: React.FC<{ selectedLanguage: Language; setSelectedLanguage: (lang: Language) => void }> = ({
  selectedLanguage,
  setSelectedLanguage
}) => {
  const { currentUser } = useAuth();
  const languages: Language[] = ['english', 'telugu', 'sanskrit', 'kannada'];

  if (!currentUser) return null;

  return (
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
          <div className="flex items-center space-x-4">
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
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

// AppContent component to handle the main app layout and routing
const AppContent: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {currentUser && <Navigation selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />}
      <React.Suspense 
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={!currentUser ? <Navigate to="/login" /> : <ProtectedRoute><Home /></ProtectedRoute>} />
          <Route 
            path="/speed-game" 
            element={<ProtectedRoute><SpeedGame language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route 
            path="/pronunciation" 
            element={<ProtectedRoute><PronunciationGame language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route 
            path="/flashcards" 
            element={<ProtectedRoute><FlashcardGame language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route 
            path="/word-of-day" 
            element={<ProtectedRoute><WordOfDay language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route 
            path="/multiple-choice" 
            element={<ProtectedRoute><MultipleChoice language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route 
            path="/word-scramble" 
            element={<ProtectedRoute><WordScramble language={selectedLanguage} /></ProtectedRoute>} 
          />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        </Routes>
      </React.Suspense>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;