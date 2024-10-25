import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import axios from 'axios';

const Profile = ({ login, setLogin, isLoggedIn, setIsLoggedIn }) => {
    const [password, setPassword] = useState('');
    const [tokenExpiry, setTokenExpiry] = useState(null);

    // Check if user is logged in on component mount
    useEffect(() => {
        const storedLogin = localStorage.getItem('login');
        const storedToken = localStorage.getItem('access_token');
        const storedExpiry = localStorage.getItem('token_expiry'); // Зберігаємо час закінчення

        if (storedLogin && storedToken && storedExpiry) {
            setLogin(storedLogin);
            setIsLoggedIn(true);
            setTokenExpiry(parseInt(storedExpiry, 10));
        }

        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            if (tokenExpiry && now >= tokenExpiry) {
                getNewToken().then(() => console.log("success")); // Оновлюємо токен, якщо термін дії сплив
            }
        }, 60000); // Перевіряємо кожну хвилину

        return () => clearInterval(interval); // Очистка інтервалу при демонтажі
    }, [tokenExpiry, setLogin, setIsLoggedIn]);

    const handleAuth = async (type) => {
        try {
            const url = `http://localhost:5000/${type}`;
            const response = await axios.post(url, {
                login,
                password
            });
            alert(response.data.message);

            if (type === 'login') {
                setIsLoggedIn(true); // Успішний вхід
                localStorage.setItem('login', login); // Save login in local storage
                localStorage.setItem('access_token', response.data.access_token); // Save access token
                localStorage.setItem('refresh_token', response.data.refresh_token); // Save refresh token

                // Зберігаємо час закінчення токена
                const expiry = Math.floor(Date.now() / 1000) + (30 * 60); // 30 хвилин у секундах
                localStorage.setItem('token_expiry', expiry);
                setTokenExpiry(expiry); // Оновлюємо стан терміну дії токена
            }
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    // Функція для виходу
    const handleLogout = () => {
        setIsLoggedIn(false);
        setLogin(''); // Очищення логіна
        setPassword(''); // Очищення пароля
        localStorage.removeItem('login'); // Remove login from local storage
        localStorage.removeItem('access_token'); // Remove access token
        localStorage.removeItem('refresh_token'); // Remove refresh token
        localStorage.removeItem('token_expiry'); // Remove token expiry
    };

    // Функція для отримання нового токена
    const getNewToken = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const response = await axios.post('http://localhost:5000/refresh', { refresh_token: refreshToken });
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);

                // Оновлюємо час закінчення токена
                const expiry = Math.floor(Date.now() / 1000) + (30 * 60); // 30 хвилин у секундах
                localStorage.setItem('token_expiry', expiry);
                setTokenExpiry(expiry); // Оновлюємо стан терміну дії токена
            } catch (error) {
                alert(error.response.data.message);
            }
        }
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
        <section className="container">
            <div>
                {isLoggedIn ? (
                    <UserProfile /> // Відображення профілю при вході
                ) : (
                    <div>
                        <h2>Профіль</h2>
                        <div className="d-grid justify-content-center align-items-center mt-5">
                            <div className="d-grid justify-center">
                                <p>Увійдіть, або зареєструйтесь</p>
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
                                        <Button onClick={() => handleAuth('login')}>Увійти</Button>
                                        <Button onClick={() => handleAuth('register')}>Зареєструватися</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Profile;