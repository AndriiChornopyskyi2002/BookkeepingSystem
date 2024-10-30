import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Header = ({ login, isLoggedIn }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-dark text-white text-center p-3">
            <div className="container">
                <div className="d-flex justify-content-end">
                    <Button
                        onClick={toggleMobileMenu}
                        className="d-md-none" // відображення тільки на мобільних пристроях
                        aria-label="Toggle navigation"
                    >
                        {isMobileMenuOpen ? <CloseIcon style={{color: 'white'}}/> : <MenuIcon style={{color: 'white'}}/>}

                    </Button>
                </div>

                <nav className={`${isMobileMenuOpen ? 'd-block' : 'd-none'} d-md-flex`}>
                    <ul className="nav justify-content-center flex-column flex-md-row">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/" onClick={() => setMobileMenuOpen(false)}>
                                Про нас
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link text-white"
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {isLoggedIn ? "Профіль" : "Увійти/Зареєструватись"}
                            </Link>
                        </li>
                        {login === "admin" && isLoggedIn && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link text-white"
                                    to="/users"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Користувачі
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <Link
                                className="nav-link text-white"
                                to="/books"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Пошук книжок
                            </Link>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link text-white"
                                    to="/savedBooks"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Збережені книги
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
