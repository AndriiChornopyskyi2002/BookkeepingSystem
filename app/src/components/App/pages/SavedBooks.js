import React, { useEffect, useState } from 'react';
import {Star} from "@mui/icons-material";
import {yellow} from "@mui/material/colors";
import {TailSpin} from "react-loader-spinner";

const SavedBooks = () => {
    const [savedBooks, setSavedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedBooks = async () => {
            const token = localStorage.getItem('access_token'); // Отримуємо токен доступу
            const response = await fetch('http://localhost:5000/user/saved-books', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Додаємо токен до заголовків
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSavedBooks(data); // Оновлюємо стан збережених книг
            } else {
                console.error('Failed to fetch saved books:', response.statusText);
            }
        };

        fetchSavedBooks().then(() => setLoading(false));
    }, []);

    return (
        <div>
            {loading ? <div className="d-grid justify-content-center"><TailSpin
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="loading"
            /></div> : <section className="container">
                <h2>Збережені книги</h2>
                {savedBooks.length > 0 ? (
                    <div className="row">
                        {savedBooks.map(book => (
                            <div key={book.id} className="col-md-4">
                                <div className="card mb-4 shadow-sm">
                                    <img
                                        style={{width: '100%'}}
                                        src={book.image}
                                        className="card-img-top"
                                        alt={book.title}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null; // Запобігання повторним викликам
                                            e.currentTarget.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgPaQLyoT4KRyKaYf6u4LuPnsJRl-yVn91iA&s'; // Можна замінити на зображення за замовчуванням
                                        }}
                                    />
                                    {book.image ? null : (
                                        <div className="card-img-top text-center">
                                            <span>Зображення не доступне</span>
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{book.title}</h5>
                                        <div className="d-flex">
                                            <p className="card-text">{book.rating}</p>
                                            <Star sx={{color: yellow[500]}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>У вас немає збережених книг.</p>
                )}
            </section>}
        </div>

    );
};

export default SavedBooks;
