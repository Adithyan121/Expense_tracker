import { useState, useContext, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, Calendar, Wallet, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExpenseContext from '../context/ExpenseContext';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const { expenses, loading, deleteExpense, filters, updateFilters } = useContext(ExpenseContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editExpense, setEditExpense] = useState(null);
    const [newBudget, setNewBudget] = useState('');
    const [useRule, setUseRule] = useState(false);
    const [aiInsights, setAiInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            if (expenses.length === 0) return;
            setLoadingInsights(true);
            try {
                const { data } = await api.get('/ai/insights');
                if (data.insight) setAiInsights(data);
            } catch (err) {
                console.error("Failed to fetch insights", err);
            } finally {
                setLoadingInsights(false);
            }
        };

        const timer = setTimeout(fetchInsights, 1000);
        return () => clearTimeout(timer);
    }, [expenses.length]);

    const monthlyStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthExpenses = expenses.filter(expense => {
            const date = new Date(expense.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const total = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        const byCategory = thisMonthExpenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        const NEEDS = ['Food', 'Bills', 'Medical', 'Rent'];
        const WANTS = ['Shopping', 'Entertainment', 'Travel', 'Other'];

        const needsTotal = thisMonthExpenses
            .filter(e => NEEDS.includes(e.category))
            .reduce((acc, curr) => acc + curr.amount, 0);

        const wantsTotal = thisMonthExpenses
            .filter(e => WANTS.includes(e.category))
            .reduce((acc, curr) => acc + curr.amount, 0);

        const highestCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

        const breakdown = Object.keys(byCategory).map(cat => ({
            category: cat,
            amount: byCategory[cat],
            percentage: total > 0 ? ((byCategory[cat] / total) * 100).toFixed(1) : 0
        })).sort((a, b) => b.amount - a.amount);

        return {
            total,
            needsTotal,
            wantsTotal,
            highestCategory: highestCategoryEntry ? highestCategoryEntry[0] : 'N/A',
            highestCategoryAmount: highestCategoryEntry ? highestCategoryEntry[1] : 0,
            count: thisMonthExpenses.length,
            breakdown
        };
    }, [expenses]);

    const budgetAnalysis = useMemo(() => {
        const budget = user?.budget || 0;
        if (budget === 0) return { status: 'No Budget Set', color: 'var(--text-secondary)', percent: 0, needsAnalysis: {}, wantsAnalysis: {}, savingsBudget: 0, totalRemaining: 0 };

        const percent = (monthlyStats.total / budget) * 100;
        let status = 'Safe';
        let color = 'var(--success-color)';

        if (percent >= 100) {
            status = 'Over Budget!';
            color = 'var(--danger-color)';
        } else if (percent >= 80) {
            status = 'Warning (80%+)';
            color = 'var(--warning-color)';
        }

        let needsAnalysis = { percent: 0, status: 'Safe', color: 'var(--success-color)', remaining: 0, budget: 0 };
        let wantsAnalysis = { percent: 0, status: 'Safe', color: 'var(--success-color)', remaining: 0, budget: 0 };
        let savingsBudget = 0;

        if (user?.budgetRule) {
            const needsBudget = budget * 0.5;
            const wantsBudget = budget * 0.3;
            savingsBudget = budget * 0.2;

            const needsPercent = (monthlyStats.needsTotal / needsBudget) * 100;
            const wantsPercent = (monthlyStats.wantsTotal / wantsBudget) * 100;

            const needsRemaining = needsBudget - monthlyStats.needsTotal;
            const wantsRemaining = wantsBudget - monthlyStats.wantsTotal;

            if (needsPercent >= 100) needsAnalysis = { percent: needsPercent, status: 'Exceeded', color: 'var(--danger-color)', remaining: needsRemaining, budget: needsBudget };
            else if (needsPercent >= 80) needsAnalysis = { percent: needsPercent, status: 'Warning', color: 'var(--warning-color)', remaining: needsRemaining, budget: needsBudget };
            else needsAnalysis = { percent: needsPercent, status: 'Safe', color: 'var(--success-color)', remaining: needsRemaining, budget: needsBudget };

            if (wantsPercent >= 100) wantsAnalysis = { percent: wantsPercent, status: 'Exceeded', color: 'var(--danger-color)', remaining: wantsRemaining, budget: wantsBudget };
            else if (wantsPercent >= 80) wantsAnalysis = { percent: wantsPercent, status: 'Warning', color: 'var(--warning-color)', remaining: wantsRemaining, budget: wantsBudget };
            else wantsAnalysis = { percent: wantsPercent, status: 'Safe', color: 'var(--success-color)', remaining: wantsRemaining, budget: wantsBudget };
        }

        const totalRemaining = budget - monthlyStats.total;

        return { status, color, percent: percent.toFixed(1), needsAnalysis, wantsAnalysis, savingsBudget, totalRemaining };
    }, [monthlyStats, user?.budget, user?.budgetRule]);

    const savingsTrend = useMemo(() => {
        const months = {};
        const today = new Date();
        const budget = user?.budget || 0;

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = { name: key, expenses: 0, budget: budget, savings: 0 };
        }

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = d.toLocaleString('default', { month: 'short' });
            if (months[key]) {
                months[key].expenses += exp.amount;
            }
        });

        return Object.values(months).map(m => ({
            ...m,
            savings: Math.max(0, m.budget - m.expenses)
        }));
    }, [expenses, user?.budget]);

    const handleEdit = (expense) => {
        setEditExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditExpense(null);
    };

    const saveBudget = async (e) => {
        e.preventDefault();
        if (newBudget && !isNaN(newBudget)) {
            try {
                await updateProfile({ budget: Number(newBudget), budgetRule: useRule });
                setIsBudgetModalOpen(false);
            } catch (err) {
                console.error("Failed to save budget:", err.response?.data?.message || err.message);
                alert(`Error saving budget: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header & Stats */}
            {/* Header & Stats */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="welcome-text">Welcome back, {user?.name}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-add">
                    <Plus size={20} />
                    <span>ADD EXPENSE</span>
                </button>
            </div>

            {/* AI Insights Section */}
            <h3 className="font-bold text-[var(--text-on-element)] text-lg mb-2 flex items-center gap-2">
                 <span className="text-[10px] bg-[var(--primary)] text-[var(--element-bg)] px-2 py-0.5 rounded-full font-bold">AI Financial Insights</span>
            </h3>
            {aiInsights && (
                <div className="mb-6 p-4 rounded-xl border border-[var(--primary)] relative overflow-hidden shadow-[0_0_15px_rgba(255,245,0,0.1)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        {/* <Brain size={100} /> */}
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-3 bg-[var(--primary)] rounded-full text-[var(--element-bg)] shrink-0">
                            {/* <Sparkles size={24} /> */}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm mb-4 leading-relaxed graph" style={{ color: 'var(--text-on-element)' }}>{aiInsights.insight}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors" style={{ backgroundColor: 'var(--bg-color)' }}>
                                    <span  style={{ color: 'var(--primary)'}}className="text-xs  block mb-1">Next Month Prediction</span>
                                    <span style={{ color: 'var(--primary)'}}className="font-bold text-xl text-[var(--text-main)]">: ₹{aiInsights.prediction.toLocaleString()}</span>
                                </div>
                                <div className="p-3 rounded border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors" style={{ backgroundColor: 'var(--bg-color)' }}>
                                    <span style={{ color: 'var(--primary)'}}className="text-xs text-[var(--text-muted)] block mb-1">Recommendation</span>
                                    <span style={{ color: 'var(--primary)'}} className="text-sm text-[var(--text-main)]">: {aiInsights.recommendation}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 opacity-80">
                <Wallet size={16} className="text-[var(--success-color)]" /> Savings Trend (6 Months)
            </h3>
            {/* Savings Trends Graph (New) */}
            {user?.budget > 0 && (
                <div className="mb-6 p-4 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={savingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    // tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    tick={{ fontSize: 12 }}
                                    tickMargin={10}
                                    height={30}
                                    style={{ color: '#00000000' }}
                                />
                                <YAxis axisLine={false} tickLine={false} 
                                // tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                                tick={{ fontSize: 10 }} 
                                tickFormatter={val => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Area type="monotone" dataKey="savings" stroke="var(--success-color)" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} name="Saved" />
                                <Area type="monotone" dataKey="expenses" stroke="var(--danger-color)" fillOpacity={0} strokeWidth={2} name="Spent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 opacity-80">
                <Wallet size={16} className="text-[var(--success-color)]" /> Quick view
            </h3>
            <div className="stats-grid">
                {/* 50/30/20 Rule Card (Separate) */}
                {user?.budgetRule && user?.budget > 0 && (
                    <div className="stat-card col-span-1 md:col-span-2 lg:col-span-1" style={{ gridColumn: 'span 2' }}> {/* Span 2 cols on mobile/tablet if needed, or just regular */}
                        <div className="stat-header">
                            <p className="stat-label">50/30/20 Breakdown</p>
                            <div className="icon-box">
                                <Wallet size={20} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 mt-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: 'var(--bg-color)', opacity: 0.8 }}>Needs (50%)</span>
                                    <span style={{ color: 'var(--bg-color)' }}>₹{budgetAnalysis.needsAnalysis.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: budgetAnalysis.needsAnalysis.remaining >= 0 ? 'var(--bg-color)' : 'var(--danger-color)', opacity: budgetAnalysis.needsAnalysis.remaining >= 0 ? 0.7 : 1 }}>
                                        {budgetAnalysis.needsAnalysis.remaining >= 0 ? 'Left:' : 'Over:'} ₹{Math.abs(budgetAnalysis.needsAnalysis.remaining).toLocaleString()}
                                    </span>
                                    <span style={{ color: budgetAnalysis.needsAnalysis.color }}>{budgetAnalysis.needsAnalysis.percent.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-500" style={{ width: `${Math.min(budgetAnalysis.needsAnalysis.percent, 100)}%`, backgroundColor: budgetAnalysis.needsAnalysis.color }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: 'var(--bg-color)', opacity: 0.8 }}>Wants (30%)</span>
                                    <span style={{ color: 'var(--bg-color)' }}>₹{budgetAnalysis.wantsAnalysis.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: budgetAnalysis.wantsAnalysis.remaining >= 0 ? 'var(--bg-color)' : 'var(--danger-color)', opacity: budgetAnalysis.wantsAnalysis.remaining >= 0 ? 0.7 : 1 }}>
                                        {budgetAnalysis.wantsAnalysis.remaining >= 0 ? 'Left:' : 'Over:'} ₹{Math.abs(budgetAnalysis.wantsAnalysis.remaining).toLocaleString()}
                                    </span>
                                    <span style={{ color: budgetAnalysis.wantsAnalysis.color }}>{budgetAnalysis.wantsAnalysis.percent.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-500" style={{ width: `${Math.min(budgetAnalysis.wantsAnalysis.percent, 100)}%`, backgroundColor: budgetAnalysis.wantsAnalysis.color }}></div>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-[rgba(0,0,0,0.1)]">
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Savings (20%)</span>
                                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Target: ₹{budgetAnalysis.savingsBudget.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="stat-card">
                    <div className="stat-header">
                        <p className="stat-label">Remaining Balance</p>
                        <div className="icon-box" style={{
                            color: (user?.budget - monthlyStats.total) >= 0 ? 'var(--success-color)' : 'var(--danger-color)',
                            backgroundColor: (user?.budget - monthlyStats.total) >= 0 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
                        }}>
                            <Wallet size={20} />
                        </div>
                    </div>
                    <h3 className="stat-value" style={{
                        color: (user?.budget - monthlyStats.total) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                        ₹{(user?.budget - monthlyStats.total).toLocaleString()}
                    </h3>
                    <p className="stat-sub">
                        {(user?.budget - monthlyStats.total) >= 0 ? 'Safe margin' : 'Overdraft alert'}
                    </p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <p className="stat-label">This Month's Total</p>
                        <div className="icon-box">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <h3 className="stat-value">₹{monthlyStats.total.toLocaleString()}</h3>
                    <p className="stat-sub">{monthlyStats.count} transactions</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <p className="stat-label">Highest Spending</p>
                        <div className="icon-box warning">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <h3 className="stat-value">{monthlyStats.highestCategory}</h3>
                    <p className="stat-sub">₹{monthlyStats.highestCategoryAmount.toLocaleString()} spent</p>
                </div>

                <div
                    onClick={() => {
                        setIsBudgetModalOpen(true);
                        setNewBudget(user?.budget || '');
                        setUseRule(user?.budgetRule || false);
                    }}
                    className="stat-card"
                    style={{ cursor: 'pointer' }}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">Budget Status {user?.budgetRule && <span className="text-xs text-primary bg-black px-2 py-0.5 rounded border border-yellow-400 ml-2">50:30:20</span>}</p>
                            <h3 className="stat-value" style={{ color: budgetAnalysis.color }}>{budgetAnalysis.status}</h3>
                        </div>
                        <Edit2 size={16} className="opacity-50" />
                    </div>

                    <div className="flex justify-between items-end mt-2">
                        <p className="stat-sub">
                            {user?.budget ? `${budgetAnalysis.percent}% of ₹${user.budget}` : 'Tap to set budget'}
                        </p>
                        {user?.budget > 0 && <p className="text-xs font-bold " style={{ color: budgetAnalysis.totalRemaining >= 0 ? 'var(--text-mine)' : 'var(--danger-color)' }}>Rem: ₹{budgetAnalysis.totalRemaining.toLocaleString()}</p>}
                    </div>

                    {user?.budget > 0 && (
                        <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-500"
                                style={{ width: `${Math.min(budgetAnalysis.percent, 100)}%`, backgroundColor: budgetAnalysis.color }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Breakdown */}
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Breakdown</h3>
            {monthlyStats.breakdown.length > 0 && (
                <div className="mb-8 p-6" style={{ backgroundColor: 'var(--element-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monthlyStats.breakdown.map((item) => (
                            <div key={item.category} className="flex flex-col gap-1 p-3 rounded" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                                <div className="flex justify-between items-center">
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.category}</span>
                                    <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{item.percentage}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div style={{ width: `${item.percentage}%`, backgroundColor: 'var(--primary)', height: '100%' }}></div>
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>₹{item.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
                        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Expenses</h3>

            <div className="filters-bar">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="search-input"
                        value={filters.keyword}
                        onChange={(e) => updateFilters({ keyword: e.target.value })}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Bills">Bills</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Medical">Medical</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="date"
                    className="filter-date"
                    value={filters.startDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value })}
                />
            </div>

            {/* List */}
            <div className="expense-list">
                <AnimatePresence>
                    {loading ? (
                        <div className="text-center p-10 opacity-50">Loading...</div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center p-10 flex flex-col items-center opacity-50">
                            <Wallet size={48} className="mb-4 opacity-50" />
                            <p>No expenses found. Start by adding one!</p>
                        </div>
                    ) : (
                        expenses.map((expense) => (
                            <motion.div
                                key={expense._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                                className="expense-item"
                            >
                                <div className="expense-info">
                                    <div className="category-icon">
                                        {expense.category.charAt(0)}
                                    </div>
                                    <div className="expense-details">
                                        <h4>{expense.title}</h4>
                                        <div className="expense-meta">
                                            <Calendar size={14} />
                                            <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                                            <span>•</span>
                                            <span>{expense.category}</span>
                                            <span>•</span>
                                            <span>{expense.paymentMethod}</span>
                                        </div>
                                        {expense.notes && <p className="text-xs opacity-50 mt-1">{expense.notes}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <span className="expense-amount">
                                        - ₹{expense.amount}
                                    </span>
                                    <div className="expense-actions">
                                        <button onClick={() => handleEdit(expense)} className="btn-icon">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(expense._id)} className="btn-icon">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <Modal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editExpense ? 'Edit Expense' : 'Add Expense'}
            >
                <ExpenseForm existingExpense={editExpense} onClose={handleCloseModal} />
            </Modal>

            <Modal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                title="Set Monthly Budget"
                className="model"
                style={{ color: 'var(--text-muted)', padding: '10px 20px', margin:'30px' }}
                >
                <form onSubmit={saveBudget}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 opacity-70">Monthly Budget Limit (₹)</label>
                        <input
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            placeholder="e.g. 20000"
                            autoFocus
                            min="0"
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        />
                    </div>
                    <div className="mb-6 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rule503020"
                            checked={useRule}
                            onChange={(e) => setUseRule(e.target.checked)}
                            className="w-4 h-4 accent-[#fff500]"
                        />
                        <label htmlFor="rule503020" className="text-sm cursor-pointer select-none">
                            Enable 50/30/20 Rule Analysis
                        </label>
                        <p className="text-xs text-gray-500 w-full ml-1 block">(50% Needs, 30% Wants, 20% Savings)</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsBudgetModalOpen(false)} style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '10px 20px', margin:'30px' }}>Cancel</button>
                        <button type="submit" style={{ background: 'var(--bg-color)', color: 'var(--primary)', padding: '10px 20px', fontWeight: 'bold' }}>Save Budget</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
