import { useState, useEffect, useContext } from 'react';
import ExpenseContext from '../context/ExpenseContext';
import { Wand2 } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import './ExpenseForm.css';

const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Medical', 'Entertainment', 'Other'];
const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank'];
const budgetCategories = ['Needs', 'Wants', 'Savings'];

const ExpenseForm = ({ existingExpense, onClose }) => {
    const { addExpense, updateExpense } = useContext(ExpenseContext);
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        budgetCategory: 'Needs',
        notes: '',
    });
    const [error, setError] = useState('');
    const [isCategorizing, setIsCategorizing] = useState(false);

    useEffect(() => {
        if (existingExpense) {
            setFormData({
                ...existingExpense,
                date: new Date(existingExpense.date).toISOString().split('T')[0]
            });
        }
    }, [existingExpense]);

    // Client-side keyword mapping (fallback)
    useEffect(() => {
        if (existingExpense) return;

        const lowerTitle = formData.title.toLowerCase();
        // ... (keep existing simple rules if you want, or remove if fully relying on AI. I'll keep them as immediate feedback)
        const rules = {
            'Food': ['kfc', 'mcdonalds', 'pizza', 'burger', 'restaurant', 'cafe', 'coffee', 'swiggy', 'zomato', 'dinner', 'lunch', 'breakfast'],
            'Travel': ['uber', 'ola', 'rapido', 'bus', 'train', 'flight', 'petrol', 'fuel', 'taxi'],
            'Shopping': ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'mall'],
            'Bills': ['electricity', 'water', 'internet', 'wifi', 'mobile', 'recharge', 'bill', 'rent'],
            'Medical': ['doctor', 'medicine', 'hospital', 'pharmacy'],
            'Entertainment': ['movie', 'cinema', 'netflix', 'prime', 'game']
        };

        for (const [cat, keywords] of Object.entries(rules)) {
            if (keywords.some(k => lowerTitle.includes(k))) {
                setFormData(prev => ({ ...prev, category: cat }));
                break;
            }
        }
    }, [formData.title]);

    const handleAICategorize = async () => {
        if (!formData.title) return;
        setIsCategorizing(true);
        try {
            const { data } = await api.post('/ai/categorize', { title: formData.title });
            if (data.category) {
                setFormData(prev => ({ ...prev, category: data.category }));
            }
        } catch (err) {
            console.error("AI Auto-cat failed", err);
        } finally {
            setIsCategorizing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.amount) {
            setError('Please fill in all required fields');
            return;
        }

        const payload = {
            ...formData,
            amount: Number(formData.amount),
        };

        let result;
        if (existingExpense) {
            result = await updateExpense(existingExpense._id, payload);
        } else {
            result = await addExpense(payload);
        }

        if (result.success) {
            onClose();
        } else {
            setError(result.message || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="expense-form">
            {error && <div className="error-alert">{error}</div>}

            <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                    <label className="form-label mb-0">Title</label>
                    <button
                        type="button"
                        onClick={handleAICategorize}
                        className="text-xs text-[#fff500] flex items-center gap-1 hover:opacity-80 transition-opacity"
                        disabled={isCategorizing || !formData.title}
                        title="Use Gemini AI to categorize"
                    >
                        <Wand2 size={12} /> {isCategorizing ? 'Thinking...' : 'AI Auto-Category'}
                    </button>
                </div>
                <input
                    type="text"
                    className=''
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dinner at KFC"
                    autoFocus
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            </div>

            {user?.budgetRule && (
                <div className="form-group">
                    <label className="form-label">Budget Category (50/30/20)</label>
                    <select
                        value={formData.budgetCategory || 'Needs'}
                        onChange={(e) => setFormData({ ...formData, budgetCategory: e.target.value })}
                        className="budget-select"
                        style={{ borderColor: 'var(--primary)' }}
                    >
                        {budgetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}

            <div className={`form-row ${formData.isRecurring ? 'mb-2' : ''}`}>
                <div className="form-group flex items-center h-full pt-6 gap-2">
                    <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.isRecurring || false}
                        onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    <label htmlFor="recurring" className="text-sm cursor-pointer select-none mb-0">Recurring Payment?</label>
                </div>

                {formData.isRecurring && (
                    <div className="form-group">
                        <label className="form-label">Frequency</label>
                        <select
                            value={formData.frequency || 'Monthly'}
                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Payment</label>
                    <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                        {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add details..."
                    rows="3"
                />
            </div>

            <div className="btn-actions">
                <button type="button" onClick={onClose} className="btn-cancel">
                    Cancel
                </button>
                <button type="submit" className="btn-submit">
                    {existingExpense ? 'Update' : 'Add'}
                </button>
            </div>
        </form>
    );
};

export default ExpenseForm;
