import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { MdLightMode, MdModeNight } from "react-icons/md";
import logo1 from '../assets/logo1.png';
import logo2 from '../assets/logo2.png';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ installPrompt, onInstallClick }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            // Night Mode (Strict Black BG, Yellow Text)
            root.style.setProperty('--primary', '#fff500');
            root.style.setProperty('--prime', '#fff500');
            root.style.setProperty('--bg-color', '#000000');
            root.style.setProperty('--surface-color', '#000000'); // Match BG
            root.style.setProperty('--text-main', '#fff500'); // Yellow text
            root.style.setProperty('--text-muted', '#fff500');
            root.style.setProperty('--text-mine', '#000000ff');
            root.style.setProperty('--border-color', '#fff500');
            root.style.setProperty('--border-active', '#fff500');

            // Elements (Cards, Inputs, Buttons) should be Yellow in Night Mode
            root.style.setProperty('--element-bg', '#fff500');
            root.style.setProperty('--text-on-element', '#000000');
        } else {
            // Day Mode (Strict Yellow BG, Black Text)
            root.style.setProperty('--primary', '#000000');
            root.style.setProperty('--prime', '#000000ff');
            root.style.setProperty('--bg-color', '#fff500'); // Yellow BG
            root.style.setProperty('--surface-color', '#fff500'); // Match BG
            root.style.setProperty('--text-main', '#000000'); // Black text
            root.style.setProperty('--text-muted', '#000000');
            root.style.setProperty('--text-mine', '#fff500');
            root.style.setProperty('--border-color', '#000000');
            root.style.setProperty('--border-active', '#000000');

            // Elements (Cards, Inputs, Buttons) should be Black in Day Mode
            root.style.setProperty('--element-bg', '#000000');
            root.style.setProperty('--text-on-element', '#fff500');
        }
    }, [isDarkMode]);

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                <img src={isDarkMode ? logo2 : logo1} alt="Bynlora" className="logo-img" />
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links desktop-only">
                <Link to="/" className={`nav-item ${isActive('/')}`}>
                    DASHBOARD
                </Link>
                <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
                    REPORTS
                </Link>
                <Link to="/ai-insights" className={`nav-item ${isActive('/ai-insights')}`}>
                    AI INSIGHTS
                </Link>
            </div>

            <div className="nav-right desktop-only">
                {installPrompt && (
                    <button
                        onClick={onInstallClick}
                        className="btn-install"
                        style={{
                            marginRight: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <Download size={18} /> INSTALL APP
                    </button>
                )}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="theme-toggle"
                >
                    {isDarkMode ? <MdLightMode size={24} /> : <MdModeNight size={24} />}
                </button>

                <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                </div>
                <button onClick={logout} className="btn-logout">
                    LOGOUT
                </button>
            </div>

            {/* Mobile Controls */}
            <div className="mobile-controls">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="theme-toggle"
                >
                    {isDarkMode ? <MdLightMode size={24} /> : <MdModeNight size={24} />}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-email">{user?.email}</div>
                    </div>
                    <Link to="/" className={`mobile-nav-item ${isActive('/')}`}>
                        DASHBOARD
                    </Link>
                    <Link to="/reports" className={`mobile-nav-item ${isActive('/reports')}`}>
                        REPORTS
                    </Link>
                    <Link to="/ai-insights" className={`mobile-nav-item ${isActive('/ai-insights')}`}>
                        AI INSIGHTS
                    </Link>
                    <button onClick={logout} className="btn-logout mobile-logout">
                        LOGOUT
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
