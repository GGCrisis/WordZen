import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the button on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed left-4 top-20 bg-white text-indigo-600 hover:bg-indigo-50 p-2 rounded-full shadow-lg transition-colors flex items-center gap-2"
      aria-label="Back to home"
    >
      <ArrowLeft size={24} />
      <span className="mr-1">Back</span>
    </button>
  );
}
