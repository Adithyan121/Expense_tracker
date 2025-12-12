import { useState, useEffect, useContext } from 'react';
import { IoSend } from "react-icons/io5";
import {
    Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, MessageSquare,
    Send, LayoutDashboard, Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import './AIAnalytics.css';

const AIAnalytics = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isCoachLoading, setIsCoachLoading] = useState(false);

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            const { data } = await api.get('/ai/analyze');
            setAnalysis(data);
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = { role: 'user', content: chatMessage };
        setChatHistory(prev => [...prev, userMsg]);
        setChatMessage('');
        setIsCoachLoading(true);

        try {
            const { data } = await api.post('/ai/coach', { message: chatMessage });
            const botMsg = { role: 'bot', content: data.message };
            setChatHistory(prev => [...prev, botMsg]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble thinking right now. Try again later." }]);
        } finally {
            setIsCoachLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="ai-page-container flex items-center justify-center h-[80vh]">
                <div className="text-center">
                    <Sparkles className="animate-spin text-[var(--primary)] mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Analyzing your finances...</h2>
                    <p className="opacity-60" style={{ color: 'var(--text-muted)' }}>Crunching numbers with LLaMA 3.3</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-page-container">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                    <Brain className="text-[var(--primary)]" />
                    AI Financial Intelligence
                </h1>
                <p className="opacity-70 mt-2" style={{ color: 'var(--text-muted)' }}>Personalized insights powered by Groq & LLaMA 3.3</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Anomaly Detection Card */}
                <div className="ai-card border-l-4 border-l-red-500">
                    <div className="card-header">
                        <AlertTriangle className="text-red-500" />
                        <h3 style={{ color: 'var(--text-on-element)' }}>Anomaly Detection</h3>
                    </div>
                    <div className="space-y-4">
                        {analysis?.anomalies?.length > 0 ? (
                            analysis.anomalies.map((item, idx) => (
                                <div key={idx} className="p-3 bg-[rgba(0,0,0,0.05)] rounded border border-red-500/20">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span style={{ color: 'var(--text-on-element)' }}>{item.title}</span>
                                        <span className="text-red-500">₹{item.amount}</span>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-on-element)', opacity: 0.8 }}>{item.reason}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm opacity-60" style={{ color: 'var(--text-on-element)' }}>No unusual spending detected recently.</p>
                        )}
                    </div>
                </div>

                {/* 2. Subscription Detection Card */}
                <div className="ai-card border-l-4 border-l-blue-500">
                    <div className="card-header">
                        <LayoutDashboard className="text-blue-500" />
                        <h3 style={{ color: 'var(--text-on-element)' }}>Recurring Subscriptions</h3>
                    </div>
                    <div className="space-y-3">
                        {analysis?.potentialSubscriptions?.length > 0 ? (
                            analysis.potentialSubscriptions.map((sub, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 border-b border-[var(--border-color)]">
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: 'var(--text-on-element)' }}>{sub.service}</p>
                                        <p className="text-xs opacity-60" style={{ color: 'var(--text-on-element)' }}>{sub.frequency}</p>
                                    </div>
                                    <span className="font-mono font-bold" style={{ color: 'var(--text-on-element)' }}>₹{sub.amount}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm opacity-60" style={{ color: 'var(--text-on-element)' }}>No recurring subscriptions identified yet.</p>
                        )}
                    </div>
                </div>

                {/* 3. Smart Savings Tips */}
                <div className="ai-card border-l-4 border-l-green-500">
                    <div className="card-header">
                        <Target className="text-green-500" />
                        <h3 style={{ color: 'var(--text-on-element)' }}>Savings Strategy</h3>
                    </div>
                    <ul className="space-y-3">
                        {analysis?.savingsTips?.map((tip, idx) => (
                            <li key={idx} className="flex gap-2 text-sm" style={{ color: 'var(--text-on-element)' }}>
                                <Lightbulb size={16} className="text-[var(--text-on-element)] shrink-0 mt-1" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 4. AI Budget Generator */}
                <div className="ai-card">
                    <div className="card-header">
                        <TrendingUp className="text-[var(--text-on-element)]" />
                        <h3 style={{ color: 'var(--text-on-element)' }}>AI Suggested Budget</h3>
                    </div>
                    <p className="text-xs mb-4 opacity-70" style={{ color: 'var(--text-on-element)' }}>Based on your spending habits, here is a recommended monthly allocation:</p>
                    <div className="space-y-3">
                        {Object.entries(analysis?.suggestedBudget || {}).map(([cat, limit]) => (
                            <div key={cat}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span style={{ color: 'var(--text-on-element)' }}>{cat}</span>
                                    <span className="font-bold" style={{ color: 'var(--text-on-element)' }}>₹{limit}</span>
                                </div>
                                <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                    <div className="h-full bg-[var(--text-on-element)] w-full opacity-50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. AI Financial Coach (Chat) */}
                <div className="ai-card flex flex-col h-[500px]">
                    <div className="card-header border-b border-[var(--border-color)] pb-3 mb-0">
                        <MessageSquare className="text-[var(--text-on-element)]" />
                        <h3 style={{ color: 'var(--text-on-element)' }}>Financial Coach</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {chatHistory.length === 0 && (
                            <div className="text-center opacity-50 mt-10" style={{ color: 'var(--text-on-element)' }}>
                                <Brain size={40} className="mx-auto mb-2" />
                                <p>Ask me anything about your finances!</p>
                                <p className="text-xs">"How can I save more?" • "Analyze my food spending"</p>
                            </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                        ? 'bg-[var(--surface-color)] font-bold text-[var(--text-main)]'
                                        : 'bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-on-element)]'
                                        }`}
                                >
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />
                                    }}>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isCoachLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-color)] p-3 rounded-lg border border-[var(--border-color)]">
                                    <span className="animate-pulse" style={{ color: 'var(--text-main)' }}>Typing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-3 border-t border-[var(--border-color)] flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded px-3 py-2
                   focus:border-[var(--primary)] outline-none transition-colors"
                            placeholder="Ask your AI coach..."
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            style={{ color: 'var(--primary)' }}
                        />
                        <button
    type="submit"
    disabled={isCoachLoading}
    className="ai-submit-btn"
>
    <IoSend size={30} className="send-icon" />
    
</button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAnalytics;
