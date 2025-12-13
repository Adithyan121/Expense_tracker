import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Register.css';
import logo from '../assets/logo2.png';
import { motion } from 'framer-motion';

const Register = () => {
    const { register, verifyOtp, resendOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [resendCooldown, setResendCooldown] = useState(30);

    useEffect(() => {
        let timer;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleResend = async () => {
        setLoading(true);
        setError('');
        try {
            await resendOtp(formData.email);
            setResendCooldown(30);
            setTimeLeft(600); // Reset expiry timer on resend
            alert('New code sent!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOtp(formData.name, formData.email, formData.password, otp);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="auth-header">
                <img src={logo} alt="Logo" className="auth-logo" />
                <p className="auth-tagline">Where your spending finds clarity</p>
            </div>
            <div className="register-card">
                <h2 className="register-title">
                    {step === 1 ? 'Create Account' : 'Verify Email'}
                </h2>
                {error && <div className="error-message">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                className="form-input"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="form-input"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Create a password"
                            />
                        </div>
                        <button type="submit" className="btn-register" disabled={loading}>
                            {loading ? 'SENDING OTP...' : 'SIGN UP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <p className="text-center mb-2 text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
                            We sent a 6-digit code to <strong>{formData.email}</strong>
                        </p>
                        <p className="text-center mb-4 text-xs font-mono" style={{ color: timeLeft < 60 ? 'var(--danger-color)' : 'var(--primary)' }}>
                            Expires in: {formatTime(timeLeft)}
                        </p>
                        <div className="form-group">
                            <label className="form-label">Enter OTP</label>
                            <input
                                className="form-input text-center text-2xl tracking-widest font-bold"
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn-register" disabled={loading || timeLeft === 0}>
                            {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                        </button>

                        <div className="resend-container text-center mt-3">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0 || loading}
                                className="text-sm underline opacity-80 hover:opacity-100"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setTimeLeft(600);
                            }}
                            className="w-full mt-3 text-sm underline opacity-60 hover:opacity-100"
                            style={{ backgroundColor: 'transparent', color: 'var(--text-muted)' }}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                <div className="register-footer">
                    Already have an account? <Link to="/login" className="link-login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
