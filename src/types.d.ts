declare module '*.tsx' {
  const content: React.ComponentType<any>;
  export default content;
}

// Game component props
interface GameProps {
  language: 'english' | 'telugu' | 'sanskrit' | 'kannada';
}

// Common interfaces
interface WordData {
  word: string;
  meaning: string;
}

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: string;
}

// Declare game component modules
declare module './components/games/SpeedGame' {
  const SpeedGame: React.ComponentType<GameProps>;
  export default SpeedGame;
}

declare module './components/games/FlashcardGame' {
  const FlashcardGame: React.ComponentType<GameProps>;
  export default FlashcardGame;
}

declare module './components/games/WordOfDay' {
  const WordOfDay: React.ComponentType<GameProps>;
  export default WordOfDay;
}

declare module './components/games/MultipleChoice' {
  const MultipleChoice: React.ComponentType<GameProps>;
  export default MultipleChoice;
}

declare module './components/games/WordScramble' {
  const WordScramble: React.ComponentType<GameProps>;
  export default WordScramble;
}

declare module './components/Leaderboard' {
  const Leaderboard: React.ComponentType;
  export default Leaderboard;
}

declare module './components/Home' {
  const Home: React.ComponentType;
  export default Home;
}