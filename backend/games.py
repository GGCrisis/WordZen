import random
from datetime import datetime, timedelta

class GameManager:
    def __init__(self, word_data):
        self.word_data = word_data
        self.active_games = {}
        self.leaderboard = {
            'speed_game': [],
            'multiple_choice': []
        }

    def start_speed_game(self, language):
        """Initialize a speed game session with enhanced randomization"""
        if language not in self.word_data:
            return None
        
        # Get all words and ensure we have enough
        words = list(self.word_data[language].items())
        num_words = min(10, len(words))  # Increased from 5 to 10 words per round
        if num_words < 5:  # Still require minimum 5 words
            return None
        
        # Select random word-meaning pairs
        selected_pairs = random.sample(words, num_words)
        
        # Create separate lists for words and meanings
        selected_words = [word for word, _ in selected_pairs]
        selected_meanings = [meaning for _, meaning in selected_pairs]
        
        # Shuffle meanings independently to break direct mapping
        random.shuffle(selected_meanings)
        
        game_id = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Store original pairs for answer checking
        self.active_games[game_id] = {
            'type': 'speed_game',
            'language': language,
            'words': dict(selected_pairs),
            'start_time': datetime.now(),
            'score': 0
        }
        
        return {
            'game_id': game_id,
            'words': selected_words,
            'meanings': selected_meanings
        }

    def check_speed_game_answer(self, game_id, word, meaning):
        """Check answer for speed game"""
        if game_id not in self.active_games:
            return {'error': 'Invalid game ID'}
        
        game = self.active_games[game_id]
        if game['type'] != 'speed_game':
            return {'error': 'Wrong game type'}
        
        if datetime.now() - game['start_time'] > timedelta(minutes=2):
            return {'error': 'Time expired'}
        
        if word in game['words'] and game['words'][word] == meaning:
            game['score'] += 1
            return {'correct': True, 'score': game['score']}
        
        return {'correct': False, 'score': game['score']}


    def get_flashcard(self, language):
        """Get a random flashcard for the specified language"""
        if language not in self.word_data:
            return None
        
        word, meaning = random.choice(list(self.word_data[language].items()))
        return {'word': word, 'meaning': meaning}

    def get_multiple_choice(self, language):
        """Generate a multiple choice question"""
        if language not in self.word_data or len(self.word_data[language]) < 4:
            return None
        
        word, correct_meaning = random.choice(list(self.word_data[language].items()))
        other_meanings = random.sample(
            [m for w, m in self.word_data[language].items() if w != word],
            3
        )
        
        choices = other_meanings + [correct_meaning]
        random.shuffle(choices)
        
        return {
            'word': word,
            'choices': choices,
            'correct_index': choices.index(correct_meaning)
        }

    def get_scrambled_word(self, language):
        """Get a scrambled word for the specified language"""
        if language not in self.word_data:
            return None
        
        word, meaning = random.choice(list(self.word_data[language].items()))
        scrambled = list(word)
        while ''.join(scrambled) == word:  # Ensure it's actually scrambled
            random.shuffle(scrambled)
        
        return {
            'original': word,
            'scrambled': ''.join(scrambled),
            'meaning': meaning
        }

    def update_leaderboard(self, game_type, player, score):
        """Update the leaderboard with a new score"""
        if game_type not in self.leaderboard:
            return False
        
        entry = {
            'player': player,
            'score': score,
            'timestamp': datetime.now().isoformat()
        }
        
        self.leaderboard[game_type].append(entry)
        # Keep only top 100 scores
        self.leaderboard[game_type] = sorted(
            self.leaderboard[game_type],
            key=lambda x: x['score'],
            reverse=True
        )[:100]
        
        return True

    def get_leaderboard(self, game_type):
        """Get the leaderboard for a specific game type"""
        if game_type not in self.leaderboard:
            return None
        
        return sorted(
            self.leaderboard[game_type],
            key=lambda x: x['score'],
            reverse=True
        )[:10]  # Return top 10