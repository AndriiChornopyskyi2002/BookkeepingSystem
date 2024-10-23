import React, { useState } from 'react';
import { Button } from "@mui/material";
import axios from 'axios';

const Profile = ({ login, setLogin, isLoggedIn, setIsLoggedIn }) => {
    const [password, setPassword] = useState('');

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
            {isLoggedIn ? (
                <UserProfile /> // Відображення профілю при вході
            ) : (
                <div>
                    <h2>Профіль</h2>
                    <div className="d-grid justify-content-center align-items-center" style={{height: '50vh'}}>


                        <div className="d-grid justify-center align-center">
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
                                    <Button onClick={() => handleAuth('register')}>Реєструватись</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Profile;
