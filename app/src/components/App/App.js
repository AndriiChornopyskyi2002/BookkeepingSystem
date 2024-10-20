import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './subComponents/Header';
import Footer from './subComponents/Footer';
import About from "./pages/About";
import Services from "./pages/Services";
import Profile from "./pages/Profile";

const App = () => {
    const [login, setLogin] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Стан для перевірки входу

    return (
        <Router>
            <div className="App">
                <Header login={login} isLoggedIn={isLoggedIn} />
                <Routes>
                    <Route path="/" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} login={login} setLogin={setLogin} />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
