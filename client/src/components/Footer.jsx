import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import './Footer.css';

const Footer = ({ installPrompt, onInstallClick }) => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h2 className="footer-logo">Bynlora</h2>
                    <p>Where your spending finds clarity.</p>
                </div>

                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/reports">Reports</Link></li>
                        <li><Link to="/ai-insights">AI Insights</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="footer-section install">
                    <h3>Get the App</h3>
                    <p>Install Bynlora on your device for offline access.</p>
                    {/* <button
                        onClick={onInstallClick}
                        className="footer-install-btn"
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: installPrompt ? 'var(--primary)' : 'var(--surface-color)',
                            color: installPrompt ? 'var(--bg-color)' : 'var(--text-muted)',
                            border: installPrompt ? 'none' : '1px solid var(--border-color)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            opacity: 1, // Always visible
                            transition: 'all 0.3s ease'
                        }}
                        title={installPrompt ? "Install App" : "App already installed or not supported"}
                    >
                        <Download size={18} /> {installPrompt ? 'Install App' : 'App Installed'}
                    </button> */}
                    <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>comchatx@gmail.com</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    &copy; {new Date().getFullYear()}{" "}
                    <a
                        href="https://adithyan-phi.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                            fontWeight: "bold"
                        }}
                    >
                        Adithyan G
                    </a>.
                    All rights reserved.
                </p>            </div>
        </footer>
    );
};

export default Footer;
