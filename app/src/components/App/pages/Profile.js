import React, { useState } from 'react';
import { Button } from "@mui/material";
import axios from 'axios';

const Profile = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Стан для перевірки входу

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                login,
                password
            });
            alert(response.data.message);
            setIsLoggedIn(true); // Успішний вхід
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:5000/register', {
                login,
                password
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    // Функція для виходу
    const handleLogout = () => {
        setIsLoggedIn(false);
        setLogin(''); // Очищення логіна
        setPassword(''); // Очищення пароля
    };

    // Компонент для відображення профілю користувача
    const UserProfile = () => (
        <div>
            <h2>Вітаємо, {login}!</h2>
            <p>Ви успішно увійшли.</p>
            <Button onClick={handleLogout} variant="outlined" color="secondary">
                Вихід
            </Button>
        </div>
    );

    // Основний рендеринг
    return (
        <section className="container my-4">
            {isLoggedIn ? (
                <UserProfile /> // Відображення профілю при вході
            ) : (
                <div>
                    <h2>Профіль</h2>
                    <p>Увійдіть, або зареєструйтесь</p>

                    <div className="d-grid justify-center align-center">
                        <div className="d-grid justify-center">
                            <h6>Логін:</h6>
                            <input
                                className="mb-2"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                            <h6>Пароль:</h6>
                            <input
                                className="mt-2 mb-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                            />

                            <div>
                                <Button onClick={handleLogin}>Увійти</Button>
                                <Button onClick={handleRegister}>Реєструватись</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Profile;
