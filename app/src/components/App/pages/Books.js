import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { TailSpin } from 'react-loader-spinner'; // Якщо ви використовуєте TailSpin

const Books = ({login}) => {
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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
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
                fetchBooks(); // Оновлюємо список книг після додавання
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

    return (
        <section className="container my-4">
            <h2>Пошук книжок</h2>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Пошук за назвою книги..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {login === "admin" ?  <Button className="mb-3" variant="primary" onClick={() => setShowModal(true)}>
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
                    <ul className="pagination justify-content-center">
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
