import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import api from '../api/axios';
import AuthContext from './AuthContext';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        startDate: '',
        endDate: '',
        paymentMethod: ''
    });

    useEffect(() => {
        if (user) {
            fetchExpenses();
        } else {
            setExpenses([]);
        }
    }, [user, filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            // Remove empty filters
            for (const [key, value] of Object.entries(filters)) {
                if (!value) params.delete(key);
            }

            const { data } = await api.get(`/expenses?${params.toString()}`);
            setExpenses(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (expenseData) => {
        try {
            const { data } = await api.post('/expenses', expenseData);
            setExpenses((prev) => [data, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message };
        }
    };

    const updateExpense = async (id, expenseData) => {
        try {
            const { data } = await api.put(`/expenses/${id}`, expenseData);
            setExpenses((prev) => prev.map((exp) => (exp._id === id ? data : exp)));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message };
        }
    };

    const deleteExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses((prev) => prev.filter((exp) => exp._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message };
        }
    };

    const updateFilters = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const value = useMemo(() => ({
        expenses,
        loading,
        error,
        filters,
        updateFilters,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshExpenses: fetchExpenses
    }), [expenses, loading, error, filters]);

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

export default ExpenseContext;
