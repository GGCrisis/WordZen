import GameCard from './GameCard';
import type { GameCard as GameCardType } from '../types/types';

const games: GameCardType[] = [
  {
    id: '1',
    title: 'Speed Challenge',
    description: 'Test your vocabulary speed with quick word matches',
    icon: '⚡',
    path: '/speed'
  },
  {
    id: '2',
    title: 'Flashcards',
    description: 'Learn words through interactive flashcards',
    icon: '🎴',
    path: '/flashcards'
  },
  {
    id: '4',
    title: 'Scenario Learning',
    description: 'Learn words in context through scenarios',
    icon: '🎭',
    path: '/scenario'
  },
  {
    id: '5',
    title: 'Word Scramble',
    description: 'Unscramble letters to find the hidden word',
    icon: '🔤',
    path: '/scramble'
  },
  {
    id: '6',
    title: 'Word of the Day',
    description: 'Learn a new word every day',
    icon: '📅',
    path: '/word-of-day'
  }
];

export default function GameGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
