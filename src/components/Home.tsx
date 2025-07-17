import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Learn Languages</span>
            <span className="block text-blue-600">Through Interactive Games</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Master English, Telugu, Sanskrit, and Kannada with our engaging collection of language learning games.
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Speed Game Card */}
          <Link
            to="/speed-game"
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-8">
              <div className="text-3xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Speed Game</h2>
              <p className="text-gray-600 mb-4">Race against time to match words with their meanings. Build your vocabulary while having fun!</p>
              <div className="text-blue-600 group-hover:text-blue-700 font-semibold flex items-center">
                Play Now
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>


          {/* Flashcards Card */}
          <Link
            to="/flashcards"
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-8">
              <div className="text-3xl mb-4">🎴</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Flashcards</h2>
              <p className="text-gray-600 mb-4">Learn and memorize words effectively with interactive flashcards and spaced repetition.</p>
              <div className="text-purple-600 group-hover:text-purple-700 font-semibold flex items-center">
                Study Now
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Word of the Day Card */}
          <Link
            to="/word-of-day"
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-8">
              <div className="text-3xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Word of the Day</h2>
              <p className="text-gray-600 mb-4">Expand your vocabulary one word at a time with daily curated words and meanings.</p>
              <div className="text-yellow-600 group-hover:text-yellow-700 font-semibold flex items-center">
                Learn Today's Word
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Multiple Choice Card */}
          <Link
            to="/multiple-choice"
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-8">
              <div className="text-3xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Multiple Choice</h2>
              <p className="text-gray-600 mb-4">Test your knowledge with challenging multiple choice questions and track your progress.</p>
              <div className="text-red-600 group-hover:text-red-700 font-semibold flex items-center">
                Take Quiz
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Word Scramble Card */}
          <Link
            to="/word-scramble"
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-8">
              <div className="text-3xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Word Scramble</h2>
              <p className="text-gray-600 mb-4">Challenge yourself by unscrambling words and improving your spelling skills.</p>
              <div className="text-indigo-600 group-hover:text-indigo-700 font-semibold flex items-center">
                Play Scramble
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose WordZen?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Learn languages effectively with our scientifically-designed games and exercises
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  🎮
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Interactive Learning</h3>
                <p className="mt-2 text-base text-gray-500">
                  Engage with the language through fun and interactive games
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  📊
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Track Progress</h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your improvement with detailed statistics
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  🌍
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Multiple Languages</h3>
                <p className="mt-2 text-base text-gray-500">
                  Learn English, Telugu, Sanskrit, and Kannada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;