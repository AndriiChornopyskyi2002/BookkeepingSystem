import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './subComponents/Header';
import Footer from './subComponents/Footer';
import About from "./pages/About";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Books from "./pages/Books";
import axios from "axios";

const App = () => {
    const [login, setLogin] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Стан для перевірки входу
    const [tokenExpiry, setTokenExpiry] = useState(null);

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

    return (
        <Router>
            <div className="App">
                <Header login={login} isLoggedIn={isLoggedIn} />
                <div className="pb-5">
                    <Routes>
                        <Route path="/" element={<About />} />
                        <Route path="/profile" element={<Profile setTokenExpiry={setTokenExpiry} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} login={login} setLogin={setLogin} />} />
                        {login === "admin" && isLoggedIn ? <Route path="/users" element={<Users />} /> : null }
                        <Route path="/books" element={<Books login={login} isLoggedIn={isLoggedIn} />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
