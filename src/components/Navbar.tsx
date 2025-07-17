import { LogOut, Info } from 'lucide-react';
import { useState } from 'react';
import AboutModal from './AboutModal';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <h1 className="text-2xl font-bold">Vocabulous</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
          >
            <Info size={20} />
            About
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
