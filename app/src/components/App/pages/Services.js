import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Services = ({ isLoggedIn, login }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [likedUsers, setLikedUsers] = useState(new Set()); // Для зберігання лайків

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleLike = (userId) => {
        const updatedLikes = new Set(likedUsers);
        if (updatedLikes.has(userId)) {
            updatedLikes.delete(userId); // Скасувати лайк
        } else {
            updatedLikes.add(userId); // Додати лайк
        }
        setLikedUsers(updatedLikes);

        // Тут ви можете додати код для запису лайків в базу даних, якщо потрібно
        // Наприклад, через axios:
        // axios.post('http://localhost:5000/like', { userId, liked: !updatedLikes.has(userId) });
    };

    return (
        <section className="container my-4">
            {isLoggedIn ? (
                <div>
                    <h2>Пошук</h2>
                    <div className="d-grid gap-4">
                        {users.map(user => (
                            <Card key={user.id} variant="outlined">
                                <CardContent>
                                    <Typography variant="h5">{user.login}</Typography>
                                    <Button
                                        onClick={() => handleLike(user.id)}
                                        variant={likedUsers.has(user.id) ? "contained" : "outlined"}
                                        color={likedUsers.has(user.id) ? "secondary" : "primary"}
                                    >
                                        {likedUsers.has(user.id) ? "Скасувати лайк" : "Лайкнути"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="d-grid justify-content-center align-center h-100">
                    <h3>Зареєструйтесь, щоб шукати нові знайомства</h3>
                    <Button onClick={() => navigate('/profile')} variant="contained" color="primary">
                        Перейти до профілю
                    </Button>
                </div>
            )}
        </section>
    );
};

export default Services;
