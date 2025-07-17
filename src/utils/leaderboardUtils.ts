export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 1, name: "Alex Chen", score: 2840, avatar: "👨‍🦰" },
  { id: 2, name: "Sarah Kim", score: 2720, avatar: "👩" },
  { id: 3, name: "Mike Ross", score: 2650, avatar: "👨" },
  { id: 4, name: "Emma Wilson", score: 2580, avatar: "👩‍🦰" },
  { id: 5, name: "David Lee", score: 2490, avatar: "👨‍🦱" },
];

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem('leaderboard');
    if (!stored) {
      localStorage.setItem('leaderboard', JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : INITIAL_LEADERBOARD;
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return INITIAL_LEADERBOARD;
  }
};

export const updateLeaderboard = (newEntry: Omit<LeaderboardEntry, 'id'>) => {
  try {
    const currentLeaderboard = getLeaderboard();
    const newId = Math.max(...currentLeaderboard.map(entry => entry.id), 0) + 1;
    
    const updatedLeaderboard = [...currentLeaderboard, { ...newEntry, id: newId }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100); // Keep only top 100 scores
      
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    return updatedLeaderboard;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return getLeaderboard();
  }
};

export const clearLeaderboard = () => {
  try {
    localStorage.removeItem('leaderboard');
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
};
