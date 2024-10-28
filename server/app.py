from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
CORS(app)

# Налаштування бази даних SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'  # Change this to a strong secret key
db = SQLAlchemy(app)

# Модель користувача
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Модель для лайків
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_login = db.Column(db.String(80), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)

# Модель книги
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(255), nullable=False)
    likes = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)

# Створення таблиці
with app.app_context():
    db.create_all()

# Генерація токена
def generate_token(user_id):
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)  # Access token expiry
    }, app.config['SECRET_KEY'], algorithm='HS256')

    refresh_token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Refresh token expiry
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return token, refresh_token

# Маршрут для входу
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(login=data['login']).first()
    if user and check_password_hash(user.password, data['password']):
        token, refresh_token = generate_token(user.id)
        return jsonify({
            "message": "Login successful",
            "access_token": token,
            "refresh_token": refresh_token
        }), 200
    return jsonify({"message": "Invalid login or password"}), 401

# Маршрут для реєстрації
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    existing_user = User.query.filter_by(login=data['login']).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    hashed_password = generate_password_hash(data['password'])
    new_user = User(login=data['login'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registration successful"}), 201

# Маршрут для отримання нового токена
@app.route('/refresh', methods=['POST'])
def refresh():
    data = request.json
    try:
        # Verify the refresh token
        decoded = jwt.decode(data['refresh_token'], app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded['user_id']
        # Generate new access token
        token, refresh_token = generate_token(user_id)
        return jsonify({
            "access_token": token,
            "refresh_token": refresh_token
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Refresh token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid refresh token"}), 401

# Маршрут для отримання списку користувачів
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = []
    for user in users:
        users_list.append({
            "id": user.id,
            "login": user.login
        })
    return jsonify(users_list), 200

# Маршрут для додавання нової книги
@app.route('/add_book', methods=['POST'])
def add_book():
    data = request.json
    if not data.get('title') or not data.get('rating') or not data.get('image'):
        return jsonify({"message": "Усі поля обов'язкові"}), 400

    new_book = Book(title=data['title'], rating=data['rating'], image=data['image'])
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"message": "Book added successfully"}), 201

# Маршрут для отримання списку книг
@app.route('/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    books_list = [
        {
            "id": book.id,
            "title": book.title,
            "rating": book.rating,
            "image": book.image,
            "likes": book.likes,
            "saves": book.saves
        }
        for book in books
    ]
    return jsonify(books_list), 200

# Маршрут для додавання або видалення лайка
@app.route('/book/<int:book_id>/like', methods=['POST'])
def toggle_like(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    action = request.json.get('action')
    user_login = request.json.get('user_login')  # Отримуємо логін користувача

    if action == 'like':
        book.likes += 1
        new_like = Like(user_login=user_login, book_id=book_id)
        db.session.add(new_like)
    elif action == 'unlike':
        book.likes -= 1
        like_to_remove = Like.query.filter_by(user_login=user_login, book_id=book_id).first()
        if like_to_remove:
            db.session.delete(like_to_remove)

    db.session.commit()
    return jsonify({"message": "Like updated", "likes": book.likes}), 200

# Маршрут для додавання або видалення збереження
@app.route('/book/<int:book_id>/save', methods=['POST'])
def toggle_save(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    action = request.json.get('action')
    if action == 'save':
        book.saves += 1
    elif action == 'unsave':
        book.saves -= 1

    db.session.commit()
    return jsonify({"message": "Save updated", "saves": book.saves}), 200

if __name__ == '__main__':
    app.run(debug=True)
