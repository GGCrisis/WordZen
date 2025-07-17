export interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

export type Language = 'english' | 'sanskrit' | 'telugu' | 'kannada';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}
