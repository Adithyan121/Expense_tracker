import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            console.log("PWA Install Prompt captured");
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            alert("Installation is not currently available. \n\nThis could be because:\n1. The app is already installed.\n2. You are not using a supported browser (Chrome/Edge).\n3. You haven't interacted with the page enough.");
            return;
        }
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    return (
        <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar installPrompt={installPrompt} onInstallClick={handleInstallClick} />
            <main className="page-content" style={{ flex: 1 }}>
                {children}
            </main>
            <Footer installPrompt={installPrompt} onInstallClick={handleInstallClick} />
        </div>
    );
};

export default Layout;
