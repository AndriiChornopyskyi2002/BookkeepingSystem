import React from 'react';

const Content = () => {
    return (
        <main className="container my-4">
            <section id="about" className="mb-4">
                <h2>Про нас</h2>
                <p>Це простий сайт, присвячений нашій компанії. Ми пропонуємо якісні послуги.</p>
            </section>
            <section id="services" className="mb-4">
                <h2>Послуги</h2>
                <p>Ми надаємо різноманітні послуги, які задовольнять ваші потреби.</p>
            </section>
            <section id="contact">
                <h2>Контакти</h2>
                <p>Для зв’язку з нами, будь ласка, напишіть на електронну пошту: info@company.com</p>
            </section>
        </main>
    );
};

export default Content;