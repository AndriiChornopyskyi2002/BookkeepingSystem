import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { TailSpin } from 'react-loader-spinner';
import Swal from "sweetalert2";
import NumberFlow from "@number-flow/react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

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
            const response = await axios.get('http://localhost:5000/books');
            setBooks(response.data);

            // Виводимо список посилань на зображення
            const imageLinks = response.data.map(book => book.image);
            console.log('Посилання на зображення книг:', imageLinks);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        fetchBooks().then(() => console.log("success"));
    }, []);

    const addBook = async (e) => {
        e.preventDefault();

        if (!newBook.title || !newBook.rating || !newBook.image) {
            setError('Усі поля обов’язкові для заповнення');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/add_book', newBook, {
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
        const fetchLikesStatus = async () => {
            if (isLoggedIn && currentBooks.length > 0) {
                const likesPromises = currentBooks.map(async (book) => {
                    const response = await axios.get(`http://localhost:5000/book/${book.id}/user-like`, {
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
                setLoading(false);
            }
        };

        // Виконуємо запит тільки якщо поточний `currentBooks` відрізняється від попереднього
        if (JSON.stringify(previousBooksRef.current) !== JSON.stringify(currentBooks)) {
            fetchLikesStatus().then(() => console.log("Success"));
            previousBooksRef.current = currentBooks; // Оновлюємо попередній стан книг
        }
    }, [currentBooks, login, isLoggedIn]);

    useEffect(() => {
        const fetchSavesStatus = async () => {
            if (isLoggedIn && currentBooks.length > 0) {
                const savesPromises = currentBooks.map(async (book) => {
                    const response = await axios.get(`http://localhost:5000/book/${book.id}/user-save`, {
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
                setLoading(false);
            }
        };

        // Виконуємо запит при першому рендерингу
        fetchSavesStatus().then(() => console.log("Fetched saves status on mount"));

        // Виконуємо запит тільки якщо поточний `currentBooks` відрізняється від попереднього
        if (JSON.stringify(previousBooksRef.current) !== JSON.stringify(currentBooks)) {
            fetchSavesStatus().then(() => console.log("Fetched saves status on books update"));
            previousBooksRef.current = currentBooks; // Оновлюємо попередній стан книг
        }
    }, [currentBooks, login, isLoggedIn]);

    const [loadingBookId, setLoadingBookId] = useState(null);

    const toggleLike = async (bookId) => {
        setLoadingBookId(bookId); // Встановлюємо поточний `bookId` для кнопки, яку натиснули

        if (isLoggedIn) {
            try {
                // Перевірка, чи є лайк від користувача для цієї книги
                const userLikeResponse = await axios.get(`http://localhost:5000/book/${bookId}/user-like`, {
                    params: { user_login: login }
                });

                const userLiked = userLikeResponse.data.liked; // true, якщо користувач вже поставив лайк
                const action = userLiked ? 'unlike' : 'like'; // Визначення дії

                // Виконання запиту для оновлення лайка
                const response = await axios.post(`http://localhost:5000/book/${bookId}/like`, {
                    action,
                    user_login: login
                });

                const updatedBooks = books.map(book =>
                    book.id === bookId ? { ...book, likes: response.data.likes } : book
                );
                setBooks(updatedBooks);
            } catch (error) {
                console.error("Error updating like:", error);
            }
        } else {
            Swal.fire({
                title: "Помилка!",
                html: 'Авторизуйтесь, щоб виконати теперішню дію <a href="#" id="go-to-profile" style="color: blue; text-decoration: underline; cursor: pointer;">тут</a>',
                icon: "error",
                didOpen: () => {
                    const link = document.getElementById('go-to-profile');
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/profile';
                    });
                }
            });
        }

        setLoadingBookId(null); // Очищаємо стан, коли запит завершено
    };

    const toggleSave = async (bookId) => {
        setLoadingBookId(bookId); // Встановлюємо поточний `bookId` для кнопки, яку натиснули

        if (isLoggedIn) {
            try {
                const userSaveResponse = await axios.get(`http://localhost:5000/book/${bookId}/user-save`, {
                    params: { user_login: login }
                });

                const userSaved = userSaveResponse.data.saved;
                const action = userSaved ? 'unsave' : 'save';

                const response = await axios.post(`http://localhost:5000/book/${bookId}/save`, {
                    action,
                    user_login: login
                });

                // Оновлення статусу збереження
                setSavesStatus(prev => ({ ...prev, [bookId]: !userSaved }));

                // Оновлення книг
                const updatedBooks = books.map(book =>
                    book.id === bookId ? { ...book, saves: response.data.saves } : book
                );
                setBooks(updatedBooks);
            } catch (error) {
                console.error("Error updating save status:", error);
            }
        } else {
            Swal.fire({
                title: "Помилка!",
                html: 'Авторизуйтесь, щоб виконати теперішню дію <a href="#" id="go-to-profile" style="color: blue; text-decoration: underline; cursor: pointer;">тут</a>',
                icon: "error",
                didOpen: () => {
                    const link = document.getElementById('go-to-profile');
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/profile';
                    });
                }
            });
        }

        setLoadingBookId(null); // Очищаємо стан, коли запит завершено
    };

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
                                    <img style={{width: '100%', height: 'auto'}} src={book.image}
                                         className="card-img-top" alt={book.title}/>
                                    <div className="card-body">
                                        <h5 className="card-title">{book.title}</h5>
                                        <p className="card-text">Рейтинг: {book.rating}</p>
                                        <div>
                                            {isLoggedIn && (
                                                <>
                                                    <div className="d-flex align-items-center">
                                                        <NumberFlow value={book.likes} trend={true}/>
                                                        <button
                                                            className="btn p-0"
                                                            disabled={loadingBookId === book.id}
                                                            onClick={() => toggleLike(book.id)}
                                                        >
                                                            {likesStatus[book.id] ? <FavoriteIcon color="error"/> :
                                                                <FavoriteBorderIcon/>}
                                                        </button>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <NumberFlow value={book.saves} trend={true}/>
                                                        <button
                                                            className="btn p-0"
                                                            disabled={loadingBookId === book.id}
                                                            onClick={() => toggleSave(book.id)}
                                                        >
                                                            {savesStatus[book.id] ? <h1>сохр</h1> :
                                                                <h1>не сохр</h1>}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
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
