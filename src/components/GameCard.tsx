import { useNavigate } from 'react-router-dom';
import type { GameCard as GameCardType } from '../types/types';

interface GameCardProps {
  game: GameCardType;
}

export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(game.path)}
      className="group bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-indigo-100"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {game.title}
        </h3>
        <p className="text-gray-600">{game.description}</p>
        <div className="w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
      </div>
    </div>
  );
}
