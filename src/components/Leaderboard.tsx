import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';
import { apiRequest, dateUtils, handleError } from '../utils';

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: string;
}

interface GameType {
  id: string;
  name: string;
  description: string;
}

const GAME_TYPES: GameType[] = [
  {
    id: 'speed_game',
    name: 'Speed Game',
    description: 'Match words with meanings against time',
  },
  {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Test your vocabulary knowledge',
  },
];

const Leaderboard: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string>(GAME_TYPES[0].id);
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<LeaderboardEntry[]>(
        API_ENDPOINTS.leaderboard.get(selectedGame)
      );
      setScores(data);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              title="Refresh scores"
            >
              🔄
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex space-x-2">
              {GAME_TYPES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedGame === game.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {game.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-gray-600">
              {GAME_TYPES.find(g => g.id === selectedGame)?.description}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner h-12 w-12" />
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
              <button
                onClick={handleRefresh}
                className="ml-2 text-sm underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : scores.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scores.map((entry, index) => (
                    <tr
                      key={`${entry.player}-${entry.timestamp}`}
                      className={`border-l-4 ${getRankStyle(index + 1)}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">{getRankEmoji(index + 1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.player}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {entry.score}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dateUtils.formatDate(new Date(entry.timestamp))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No scores yet. Be the first to play!
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">About the Leaderboard:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Scores are updated in real-time</li>
          <li>Only the top 10 scores are displayed</li>
          <li>Different games have separate leaderboards</li>
          <li>Keep playing to improve your ranking!</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;