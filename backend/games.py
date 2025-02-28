import random
from datetime import datetime, timedelta
import json
import time
import os
import requests
import base64
import tempfile
import wave
import logging

class GameManager:
    def _get_leaderboard_path(self, game_type):
        """Get the path to the leaderboard JSON file"""
        os.makedirs('data/leaderboards', exist_ok=True)
        return f'data/leaderboards/{game_type}_leaderboard.json'
    def __init__(self, word_data):
        self.word_data = word_data
        self.active_games = {}
        self._init_local_leaderboards()

    def _init_local_leaderboards(self):
        """Initialize local JSON leaderboards if they don't exist"""
        try:
            for game_type in ['speed_game', 'multiple_choice']:
                leaderboard_path = self._get_leaderboard_path(game_type)
                if not os.path.exists(leaderboard_path):
                    with open(leaderboard_path, 'w') as f:
                        json.dump([], f)
                    print(f"Initialized empty leaderboard for {game_type}")
        except Exception as e:
            print(f"Error initializing local leaderboards: {str(e)}")

    def start_speed_game(self, language):
        """Initialize a speed game session with sets of 10 words"""
        if language not in self.word_data:
            return None
        
        all_words = list(self.word_data[language].items())
        if len(all_words) < 10:
            return None
        
        selected_words = random.sample(all_words, 10)
        game_id = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Initialize game state with used_words tracking
        self.active_games[game_id] = {
            'type': 'speed_game',
            'language': language,
            'words': dict(selected_words),
            'start_time': datetime.now(),
            'score': 0,
            'used_words': set(word for word, _ in selected_words),
            'available_words': set(word for word, _ in all_words) - set(word for word, _ in selected_words),
            'completed_sets': 0
        }
        
        # Get words and meanings separately and shuffle meanings
        words = [word for word, _ in selected_words]
        meanings = [meaning for _, meaning in selected_words]
        for _ in range(3):  # Multiple shuffles for better randomization
            random.shuffle(meanings)
        
        return {
            'game_id': game_id,
            'words': words,
            'meanings': meanings
        }

    def get_next_word_set(self, game_id):
        """Get the next set of 10 words for an active speed game"""
        if game_id not in self.active_games:
            return {'error': 'Invalid game ID'}
        
        game = self.active_games[game_id]
        if game['type'] != 'speed_game':
            return {'error': 'Wrong game type'}
        
        if datetime.now() - game['start_time'] > timedelta(minutes=2):
            return {'error': 'Time expired'}
        
        # Check if there are enough available words
        if len(game['available_words']) < 10:
            return {'error': 'No more words available'}
        
        # Select 10 new words from available words
        new_words = random.sample(list(game['available_words']), 10)
        selected_words = [(word, self.word_data[game['language']][word]) for word in new_words]
        
        # Update game state
        game['words'] = dict(selected_words)
        game['used_words'].update(new_words)
        game['available_words'] -= set(new_words)
        game['completed_sets'] += 1
        
        # Prepare response
        words = [word for word, _ in selected_words]
        meanings = [meaning for _, meaning in selected_words]
        for _ in range(3):
            random.shuffle(meanings)
        
        return {
            'words': words,
            'meanings': meanings
        }

    def check_speed_game_answer(self, game_id, word, meaning):
        """Check answer for speed game and load new set if needed"""
        if game_id not in self.active_games:
            return {'error': 'Invalid game ID'}
        
        game = self.active_games[game_id]
        if game['type'] != 'speed_game':
            return {'error': 'Wrong game type'}
        
        if datetime.now() - game['start_time'] > timedelta(minutes=2):
            return {'error': 'Time expired'}
        
        # Check if word exists in current set
        if word not in game['words']:
            return {'correct': False, 'score': game['score'], 'needs_new_set': False}
        
        # Get the correct meaning for the word
        correct_meaning = game['words'][word]
        
        # Check if the meaning matches
        if meaning == correct_meaning:
            # Increment score and remove matched word
            game['score'] += 1
            del game['words'][word]
            
            # Check if we need a new set
            needs_new_set = len(game['words']) == 0
            
            return {
                'correct': True,
                'score': game['score'],
                'needs_new_set': needs_new_set
            }
        
        # Wrong meaning
        return {
            'correct': False,
            'score': game['score'],
            'needs_new_set': False
        }

    def check_pronunciation(self, language, word, audio_data):
        """Check pronunciation using SpeechRecognition"""
        import speech_recognition as sr
        import base64
        import os
        import tempfile
        import wave
        import logging

        logging.basicConfig(level=logging.DEBUG)
        logger = logging.getLogger('pronunciation_check')

        wav_file = None
        try:
            logger.debug(f"Starting pronunciation check for word: {word} in language: {language}")
            
            # Validate audio data
            if not audio_data:
                logger.error("No audio data received")
                return {
                    'correct': False,
                    'feedback': 'No audio data received. Please try again.',
                    'recognized_text': None
                }

            # Extract and decode base64 audio data
            try:
                if ',' in audio_data:
                    audio_data = audio_data.split(',')[1]
                audio_bytes = base64.b64decode(audio_data)
                logger.debug(f"Decoded {len(audio_bytes)} bytes of audio data")
            except Exception as e:
                logger.error(f"Error decoding audio data: {str(e)}")
                return {
                    'correct': False,
                    'feedback': 'Invalid audio format. Please try again.',
                    'recognized_text': None
                }

            # Create WAV file for speech recognition
            try:
                wav_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
                with wave.open(wav_file.name, 'wb') as wav:
                    wav.setnchannels(1)
                    wav.setsampwidth(2)
                    wav.setframerate(16000)
                    wav.writeframes(audio_bytes)

                # Initialize speech recognition
                recognizer = sr.Recognizer()
                with sr.AudioFile(wav_file.name) as source:
                    audio = recognizer.record(source)
                
                # Convert language code to SpeechRecognition format
                lang_code = {
                    'english': 'en-US',
                    'kannada': 'kn-IN',
                    'telugu': 'te-IN',
                    'sanskrit': 'sa-IN'
                }.get(language, 'en-US')

                # Perform speech recognition
                try:
                    recognized_text = recognizer.recognize_google(audio, language=lang_code).lower()
                    logger.debug(f"Recognized text: {recognized_text}")

                    # Compare with expected word
                    similarity = self._calculate_similarity(word.lower(), recognized_text)
                    logger.debug(f"Similarity score: {similarity}")

                    if similarity >= 0.8:
                        return {
                            'correct': True,
                            'feedback': 'Perfect pronunciation! 🎉',
                            'recognized_text': recognized_text
                        }
                    elif similarity >= 0.6:
                        return {
                            'correct': True,
                            'feedback': f'Good try! I heard "{recognized_text}". Keep practicing!',
                            'recognized_text': recognized_text
                        }
                    else:
                        return {
                            'correct': False,
                            'feedback': f'Keep practicing! I heard "{recognized_text}".',
                            'recognized_text': recognized_text
                        }

                except sr.UnknownValueError:
                    logger.error("Speech recognition could not understand audio")
                    return {
                        'correct': False,
                        'feedback': 'Could not understand your speech. Please try again.',
                        'recognized_text': None
                    }
                except sr.RequestError as e:
                    logger.error(f"Speech recognition error: {str(e)}")
                    return {
                        'correct': False,
                        'feedback': 'Speech recognition service error. Please try again.',
                        'recognized_text': None
                    }

            except Exception as e:
                logger.error(f"Error processing audio: {str(e)}")
                return {
                    'correct': False,
                    'feedback': 'Error processing audio. Please try again.',
                    'recognized_text': None
                }
                
        except Exception as e:
            logger.error(f"Unexpected error in pronunciation check: {str(e)}")
            return {
                'correct': False,
                'feedback': 'An unexpected error occurred. Please try again.',
                'recognized_text': None
            }
        finally:
            # Clean up the temporary file
            try:
                if wav_file and os.path.exists(wav_file.name):
                    os.unlink(wav_file.name)
                    logger.debug("Successfully cleaned up temporary WAV file")
            except Exception as e:
                logger.error(f"Error cleaning up temporary file: {str(e)}")

    def _compare_pronunciation(self, expected, actual, language):
        """Simple word comparison for pronunciation check"""
        expected_lower = expected.lower().strip()
        actual_lower = actual.lower().strip()
        
        # Remove any transliteration in parentheses
        if '(' in expected_lower:
            expected_lower = expected_lower.split('(')[0].strip()
        
        # Split into words and find common words
        expected_words = set(expected_lower.split())
        actual_words = set(actual_lower.split())
        common_words = expected_words.intersection(actual_words)
        
        # If any word matches, consider it correct
        if common_words:
            return {
                'correct': True,
                'feedback': 'Good job! Your pronunciation was understood.',
                'recognized_text': actual
            }
        
        # If words are similar enough, also consider it correct
        for exp_word in expected_words:
            for act_word in actual_words:
                if self._calculate_similarity(exp_word, act_word) > 0.5:
                    return {
                        'correct': True,
                        'feedback': f'Close enough! The word was recognized as "{actual}".',
                        'recognized_text': actual
                    }
        
        return {
            'correct': False,
            'feedback': f'Try again. The word was recognized as "{actual}".',
            'recognized_text': actual
        }

    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate string similarity using Levenshtein distance"""
        if not str1 or not str2:
            return 0.0
        
        # Simple Levenshtein distance implementation
        m, n = len(str1), len(str2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
            
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if str1[i-1] == str2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j],      # deletion
                                     dp[i][j-1],      # insertion
                                     dp[i-1][j-1])    # substitution
        
        max_len = max(m, n)
        similarity = 1 - (dp[m][n] / max_len)
        return similarity

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
        """Update the leaderboard with a new score in local JSON storage"""
        if game_type not in ['speed_game', 'multiple_choice']:
            return False
        
        try:
            entry = {
                'player': player,
                'score': score,
                'timestamp': datetime.now().isoformat()
            }
            
            leaderboard_path = self._get_leaderboard_path(game_type)
            
            # Read current leaderboard
            try:
                with open(leaderboard_path, 'r') as f:
                    leaderboard = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                leaderboard = []
            
            # Add new entry
            leaderboard.append(entry)
            
            # Sort and keep top 100 scores
            leaderboard = sorted(leaderboard, key=lambda x: x['score'], reverse=True)[:100]
            
            # Write updated leaderboard
            with open(leaderboard_path, 'w') as f:
                json.dump(leaderboard, f, indent=2)
            
            return True
            
        except Exception as e:
            print(f"Error updating leaderboard: {str(e)}")
            return False

    def get_leaderboard(self, game_type):
        """Get the leaderboard for a specific game type from local JSON storage"""
        if game_type not in ['speed_game', 'multiple_choice']:
            return None
            
        try:
            leaderboard_path = self._get_leaderboard_path(game_type)
            
            try:
                with open(leaderboard_path, 'r') as f:
                    leaderboard = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                return []
            
            return sorted(leaderboard, key=lambda x: x['score'], reverse=True)[:10]  # Return top 10
            
        except Exception as e:
            print(f"Error getting leaderboard: {str(e)}")
            return []