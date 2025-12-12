import { useContext, useMemo } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Download } from 'lucide-react';
import ExpenseContext from '../context/ExpenseContext';
import './Reports.css';

// Minimal monochrome/yellow palette
const COLORS = ['var(--primary)', '#fc2a2aff', '#2548f9ff', '#888888', '#555555', '#333333'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--text-main)' }}>{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.color || 'var(--primary)', fontSize: '0.9rem' }}>
                        {pld.name}: <span style={{ fontWeight: 'bold' }}>₹{pld.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const { expenses } = useContext(ExpenseContext);

    // ... (downloadCSV function remains similar, ensuring headers/content logic is preserved if not changing) ...
    const downloadCSV = () => {
        if (!expenses || expenses.length === 0) {
            alert("No expenses to download.");
            return;
        }

        const headers = ["Title", "Amount", "Category", "Date", "Payment Method", "Notes"];
        const csvContent = [
            headers.join(","),
            ...expenses.map(e => {
                const row = [
                    `"${e.title.replace(/"/g, '""')}"`,
                    e.amount,
                    e.category,
                    new Date(e.date).toLocaleDateString(),
                    e.paymentMethod,
                    `"${(e.notes || '').replace(/"/g, '""')}"`
                ];
                return row.join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const categoryData = useMemo(() => {
        const data = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(data).map((name, index) => ({
            name,
            value: data[name],
            color: COLORS[index % COLORS.length]
        }));
    }, [expenses]);

    const monthlyData = useMemo(() => {
        const data = expenses.reduce((acc, curr) => {
            const month = curr.date.substring(0, 7);
            acc[month] = (acc[month] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(data).sort().map(month => ({
            month,
            amount: data[month]
        }));
    }, [expenses]);

    const trendData = useMemo(() => {
        const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const grouped = sorted.reduce((acc, curr) => {
            const date = curr.date.substring(0, 10);
            acc[date] = (acc[date] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(grouped).map(date => ({ date, amount: grouped[date] }));
    }, [expenses]);

    return (
        <div className="reports-container">
            <div className="flex justify-between items-center mb-6">
                <h2 className="reports-title mb-0">Financial Analytics</h2>
                <button
                    onClick={downloadCSV}
                    style={{ background: 'var(--text-muted)', color: 'var(--bg-color)', padding: '10px 20px', margin:'30px' }}
                >
                    <Download size={18} />
                    <span className="font-bold text-sm">Download Report</span>
                </button>
            </div>

            <div className="charts-grid">
                {/* Pie Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Expense Breakdown</h3>
                    <div className="chart-wrapper" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="var(--bg-color)"
                                    strokeWidth={2}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart - Monthly */}
                <div className="chart-card">
                    <h3 className="chart-title">Monthly Spending</h3>
                    <div className="chart-wrapper" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barSize={40}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar
                                    dataKey="amount"
                                    fill="url(#barGradient)"
                                    radius={[8, 8, 0, 0]}
                                    name="Top Spend"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Area Chart - Trends (Replaces Line Chart) */}
            <div className="chart-card" style={{ marginTop: '24px' }}>
                <h3 className="chart-title">Expense Trend (Daily)</h3>
                <div className="chart-wrapper" style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickFormatter={str => str.substring(5)}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#trendGradient)"
                                name="Daily Spend"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
