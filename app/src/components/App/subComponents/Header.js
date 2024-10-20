import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({login, isLoggedIn}) => {
    return (
        <header className="bg-dark text-white text-center p-3">
            <h1>Сайт знайомств</h1>
            <nav>
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/">Про нас</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/services">Послуги</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/profile">Профіль</Link>
                    </li>
                    {login === "admin" && isLoggedIn ? <li className="nav-item">
                        <Link className="nav-link text-white" to="/profile">Користувачі</Link>
                    </li> : null}

                </ul>
            </nav>
        </header>
    );
};

export default Header;
