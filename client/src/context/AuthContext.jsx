import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        return data;
    };

    const verifyOtp = async (name, email, password, otp) => {
        const { data } = await api.post('/auth/verify-otp', { name, email, password, otp });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const resendOtp = async (email) => {
        const { data } = await api.post('/auth/resend-otp', { email });
        return data;
    };

    const updateProfile = async (profileData) => {
        const { data } = await api.put('/auth/profile', profileData);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            verifyOtp,
            resendOtp,
            logout,
            updateProfile,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
