import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Стан для відстеження завантаження

    // Викликаємо API для отримання користувачів при завантаженні компонента
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users');
                setUsers(response.data); // Зберігаємо користувачів в стані
                setLoading(false); // Вимикаємо стан завантаження
            } catch (error) {
                console.error('Помилка отримання користувачів', error);
                setLoading(false);
            }
        };

        fetchUsers(); // Викликаємо функцію при першому рендері компонента
    }, []);

    return (
        <section className="container">
            {loading ? <div className="d-flex justify-content-center">
                <TailSpin
                    height="80"
                    width="80"
                    color="#4fa94d"
                    ariaLabel="loading"
                />
            </div> : <div><h2>Користувачі</h2>
                <table className="table table-striped">
                <thead>
                <tr>
                <th>#</th>
                <th>Логін</th>
                </tr>
                </thead>
                <tbody>
            {users.map((user, index) => (
                <tr key={user.id}>
            <td>{index + 1}</td>
            <td>{user.login}</td>
        </tr>
    ))}
</tbody>
</table></div>}
        </section>
    );
};

export default Users;
