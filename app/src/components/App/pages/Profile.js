import React from 'react';
import {Button} from "@mui/material";

const Login = () => {
    return (
        <section className="container my-4">
            <h2>Профіль</h2>
            <p>Увійдіть, або зареєструйтесь</p>

            <div className="d-grid justify-center align-center">
                <div className="d-grid justify-center">
                    <h6>Логін:</h6>
                    <input className="mb-2"/>
                    <h6>Пароль:</h6>
                    <input className="mt-2 mb-2"/>

                    <div>
                        <Button>Увійти</Button>
                        <Button>Реєструватись</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
