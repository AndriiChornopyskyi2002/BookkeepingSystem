import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({login, isLoggedIn}) => {
    return (
        <header className="bg-dark text-white text-center p-3">
            <h1>Бібліотека</h1>
            <nav>
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/">Про нас</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/services">Пошук</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white"
                              to="/profile">{isLoggedIn ? "Профіль" : "Увійти/Зареєструватись"}</Link>
                    </li>
                    {login === "admin" && isLoggedIn ? <li className="nav-item">
                        <Link className="nav-link text-white" to="/users">Користувачі</Link>
                    </li> : null}
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/books">Пошук книжок</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
