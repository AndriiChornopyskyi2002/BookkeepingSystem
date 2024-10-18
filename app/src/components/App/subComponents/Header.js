import React from 'react';

const Header = () => {
    return (
        <header className="bg-dark text-white text-center p-3">
            <h1>Назва компанії</h1>
            <nav>
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link text-white" href="#about">Про нас</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white" href="#services">Послуги</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white" href="#contact">Контакти</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;