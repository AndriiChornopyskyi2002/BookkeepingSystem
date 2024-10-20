from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Налаштування бази даних SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Модель користувача
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Створення таблиці
with app.app_context():
    db.create_all()

# Маршрут для входу
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(login=data['login']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({"message": "Login successful"}), 200
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

# Маршрут для отримання списку користувачів
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()  # Отримуємо всіх користувачів з бази
    users_list = []
    for user in users:
        users_list.append({
            "id": user.id,
            "login": user.login
        })
    return jsonify(users_list), 200

if __name__ == '__main__':
    app.run(debug=True)
