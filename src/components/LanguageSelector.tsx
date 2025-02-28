import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageOption } from '../types/types';

const languages: LanguageOption[] = [
  { code: 'english', name: 'English', nativeName: 'English' },
  { code: 'sanskrit', name: 'Sanskrit', nativeName: 'Sanskrit' },
  { code: 'telugu', name: 'Telugu', nativeName: 'Telugu' },
  { code: 'kannada', name: 'Kannada', nativeName: 'Kannada' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe size={20} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-indigo-700 text-white border border-indigo-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
