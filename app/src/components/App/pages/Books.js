import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { TailSpin } from 'react-loader-spinner';
import Swal from "sweetalert2";
import NumberFlow from "@number-flow/react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SaveIcon from "@mui/icons-material/Save";
import {Star} from "@mui/icons-material";
import {red, yellow} from "@mui/material/colors";

const Books = ({login, isLoggedIn}) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBook, setNewBook] = useState({ title: '', rating: '', image: '' });
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 6; // Кількість книг на сторінці
    const [searchTerm, setSearchTerm] = useState(''); // Стан для ключових слів

    // Функція для отримання списку книг
    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://bookkeepingsystem.onrender.com/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        fetchBooks().then(() => setLoading(false));
    }, []);

    const addBook = async (e) => {
        e.preventDefault();

        if (!newBook.title || !newBook.rating || !newBook.image) {
            setError('Усі поля обов’язкові для заповнення');
            return;
        }

        try {
            const response = await axios.post('https://bookkeepingsystem.onrender.com/add_book', newBook, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.message === 'Book added successfully') {
                await fetchBooks(); // Оновлюємо список книг після додавання
                setNewBook({ title: '', rating: '', image: '' });
                setError('');
                setShowModal(false); // Закриваємо модальне вікно
            }
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    // Логіка для пагінації
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const totalPages = Math.ceil(books.length / booksPerPage);

    // Фільтрація книг за ключовими словами
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const [likesStatus, setLikesStatus] = useState({});
    const [savesStatus, setSavesStatus] = useState({});

    const previousBooksRef = useRef();

    useEffect(() => {
        const fetchStatus = async () => {
            if (currentBooks.length > 0) {
                try {
                    // Отримання статусу вподобань
                    const likesPromises = currentBooks.map(async (book) => {
                        const response = await axios.get(`https://bookkeepingsystem.onrender.com/book/${book.id}/user-like`, {
                            params: { user_login: login }
                        });
                        return { bookId: book.id, liked: response.data.liked };
                    });

                    const likesData = await Promise.all(likesPromises);
                    const updatedLikesStatus = likesData.reduce((acc, { bookId, liked }) => {
                        acc[bookId] = liked;
                        return acc;
                    }, {});
                    setLikesStatus(updatedLikesStatus);

                    // Отримання статусу збережень
                    const savesPromises = currentBooks.map(async (book) => {
                        const response = await axios.get(`https://bookkeepingsystem.onrender.com/book/${book.id}/user-save`, {
                            params: { user_login: login }
                        });
                        return { bookId: book.id, saved: response.data.saved };
                    });

                    const savesData = await Promise.all(savesPromises);
                    const updatedSavesStatus = savesData.reduce((acc, { bookId, saved }) => {
                        acc[bookId] = saved;
                        return acc;
                    }, {});
                    setSavesStatus(updatedSavesStatus);

                    // Встановлюємо loading в false лише після успішного завершення обох запитів
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching static:", error);
                    // Обробка помилки, якщо це необхідно
                }
            }
        };

        // Виконуємо запит тільки якщо поточний `currentBooks` відрізняється від попереднього
        if (JSON.stringify(previousBooksRef.current) !== JSON.stringify(currentBooks)) {
            fetchStatus().then(() => console.log("Success"));
            previousBooksRef.current = currentBooks; // Оновлюємо попередній стан книг
        }
    }, [currentBooks, login, isLoggedIn]);


    const [loadingBookId, setLoadingBookId] = useState(null);

    const toggleAction = async (bookId, actionType) => {
        setLoadingBookId(bookId); // Встановлюємо ID книги для кнопки, яку натиснули

        if (!isLoggedIn) {
            Swal.fire({
                title: "Помилка!",
                html: 'Авторизуйтесь, щоб виконати дію <a href="#" id="go-to-profile" style="color: blue; text-decoration: underline; cursor: pointer;">тут</a>',
                icon: "error",
                didOpen: () => {
                    const link = document.getElementById('go-to-profile');
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/profile';
                    });
                }
            });
            setLoadingBookId(null);
            return;
        }

        try {
            // Перевірка, чи є дія виконаною
            const userActionResponse = await axios.get(`https://bookkeepingsystem.onrender.com/book/${bookId}/user-${actionType}`, {
                params: { user_login: login }
            });

            const userActioned = userActionResponse.data[actionType === 'like' ? 'liked' : 'saved']; // true, якщо дія виконана
            const action = userActioned ? `un${actionType}` : actionType; // Визначення дії (лайк/зняття лайка або збереження/видалення збереження)

            // Запит на оновлення статусу
            const response = await axios.post(`https://bookkeepingsystem.onrender.com/book/${bookId}/${actionType}`, {
                action,
                user_login: login
            });

            // Оновлення статусу дії
            const updatedBooks = books.map(book =>
                book.id === bookId
                    ? {
                        ...book,
                        [actionType === 'like' ? 'likes' : 'saves']: response.data[actionType === 'like' ? 'likes' : 'saves']
                    }
                    : book
            );

            setBooks(updatedBooks);

            // Оновлення статусу кнопок
            if (actionType === 'like') {
                setLikesStatus(prev => ({ ...prev, [bookId]: action === 'like' }));
            } else {
                setSavesStatus(prev => ({ ...prev, [bookId]: action === 'save' }));
            }
        } catch (error) {
            console.error(`Error updating ${actionType} status:`, error);
        } finally {
            setLoadingBookId(null); // Завершення завантаження
        }
    };

    const toggleLike = (bookId) => toggleAction(bookId, 'like');
    const toggleSave = (bookId) => toggleAction(bookId, 'save');

    return (
        <section className="container">
            <h2>Пошук книжок</h2>

            <div className="mb-3 mt-5">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Пошук за назвою книги..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {login === "admin" && isLoggedIn ?  <Button className="mb-3" variant="primary" onClick={() => setShowModal(true)}>
                Додати книгу
            </Button> : null}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Додати нову книгу</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={addBook}>
                        <div className="form-group">
                            <label htmlFor="title">Назва книги</label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                value={newBook.title}
                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="rating">Рейтинг</label>
                            <input
                                type="number"
                                step="0.1"
                                max="10"
                                min="0"
                                className="form-control"
                                id="rating"
                                value={newBook.rating}
                                onChange={(e) => setNewBook({ ...newBook, rating: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="image">Посилання на зображення</label>
                            <input
                                type="text"
                                className="form-control"
                                id="image"
                                value={newBook.image}
                                onChange={(e) => setNewBook({ ...newBook, image: e.target.value })}
                            />
                        </div>
                        <Button className="mt-3" type="submit" variant="primary">
                            Додати книгу
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>

            {!loading ? <div>
                <section className="row">
                    {currentBooks.length > 0 ? (
                        currentBooks.map((book) => (
                            <div key={book.id} className="col-md-4">
                                <div className="card mb-4 shadow-sm">
                                    <img
                                        style={{width: '100%', height: '300px', objectFit: 'cover'}}
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

                                            <>
                                                <div>
                                                    <NumberFlow value={book.likes} trend={true}/>
                                                    <button
                                                        className="p-0 border-0 bg-transparent"
                                                        disabled={loadingBookId === book.id}
                                                        onClick={() => toggleLike(book.id)}
                                                    >
                                                        {likesStatus[book.id] ?
                                                            <FavoriteIcon sx={{color: red[500]}}/> :
                                                            <FavoriteIcon color="disabled"/>}
                                                    </button>
                                                </div>
                                                <div>
                                                    <NumberFlow value={book.saves} trend={true}/>
                                                    <button
                                                        className="p-0 border-0 bg-transparent"
                                                        disabled={loadingBookId === book.id}
                                                        onClick={() => toggleSave(book.id)}
                                                    >
                                                        {savesStatus[book.id] ? <SaveIcon color="primary"/> :
                                                            <SaveIcon color="disabled"/>}
                                                    </button>
                                                </div>
                                            </>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center">Немає доступних книг</div>
                    )}
                </section>

                {/* Кнопки пагінації */}
                <nav>
                    <ul className="pagination justify-content-center p-5">
                        {Array.from({length: totalPages}, (_, index) => (
                            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => paginate(index + 1)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div> : <div className="d-grid justify-content-center"><TailSpin
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="loading"
            /></div>}
        </section>
    );
};

export default Books;
