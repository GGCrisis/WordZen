from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from games import GameManager

app = Flask(__name__)
CORS(app)

# Initialize word databases for different languages
WORDS = {
    'english': {},
    'telugu': {},
    'sanskrit': {},
    'kannada': {}
}

# Load word data and initialize game manager
def initialize_game_manager():
    try:
        for language in WORDS.keys():
            with open(f'data/{language}_words.json', 'r', encoding='utf-8') as f:
                WORDS[language] = json.load(f)
        return GameManager(WORDS)
    except FileNotFoundError as e:
        print(f"Error loading word data: {e}")
        return None

game_manager = initialize_game_manager()

@app.route('/api/languages', methods=['GET'])
def get_languages():
    return jsonify(list(WORDS.keys()))

@app.route('/api/word-of-day/<language>', methods=['GET'])
def word_of_day(language):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    flashcard = game_manager.get_flashcard(language)
    if not flashcard:
        return jsonify({'error': 'Language not supported or no words available'}), 400
    return jsonify(flashcard)

@app.route('/api/speed-game/start/<language>', methods=['POST'])
def start_speed_game(language):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    game_data = game_manager.start_speed_game(language)
    if not game_data:
        return jsonify({'error': 'Could not start game'}), 400
    return jsonify(game_data)

@app.route('/api/speed-game/check', methods=['POST'])
def check_speed_game():
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    data = request.get_json()
    if not data or 'game_id' not in data or 'word' not in data or 'meaning' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    result = game_manager.check_speed_game_answer(data['game_id'], data['word'], data['meaning'])
    return jsonify(result)


@app.route('/api/leaderboard/<game_type>', methods=['GET'])
def get_leaderboard(game_type):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    leaderboard = game_manager.get_leaderboard(game_type)
    if leaderboard is None:
        return jsonify({'error': 'Invalid game type'}), 400
    return jsonify(leaderboard)

@app.route('/api/leaderboard/<game_type>', methods=['POST'])
def update_leaderboard(game_type):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    data = request.get_json()
    if not data or 'player' not in data or 'score' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    success = game_manager.update_leaderboard(game_type, data['player'], data['score'])
    if not success:
        return jsonify({'error': 'Failed to update leaderboard'}), 400
    return jsonify({'status': 'success'})

@app.route('/api/multiple-choice/<language>', methods=['GET'])
def get_multiple_choice(language):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    question = game_manager.get_multiple_choice(language)
    if not question:
        return jsonify({'error': 'Could not generate question'}), 400
    return jsonify(question)

@app.route('/api/scramble/<language>', methods=['GET'])
def get_scrambled_word(language):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    scrambled = game_manager.get_scrambled_word(language)
    if not scrambled:
        return jsonify({'error': 'Could not generate scrambled word'}), 400
    return jsonify(scrambled)

@app.route('/api/flashcard/<language>', methods=['GET'])
def get_flashcard(language):
    if not game_manager:
        return jsonify({'error': 'Game system not initialized'}), 500
    flashcard = game_manager.get_flashcard(language)
    if not flashcard:
        return jsonify({'error': 'Could not get flashcard'}), 400
    return jsonify(flashcard)

if __name__ == '__main__':
    if not game_manager:
        print("Error: Could not initialize game manager")
        exit(1)
    app.run(debug=True, port=5000)