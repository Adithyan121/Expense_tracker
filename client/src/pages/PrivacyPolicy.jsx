import React from 'react';
import { Shield, Lock, Eye, FileText, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <Shield size={64} className="mx-auto mb-4 text-[var(--primary)]" />
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-lg opacity-70" style={{ color: 'var(--text-muted)' }}>Last Updated: December 2025</p>
                </header>

                <div className="space-y-8">
                    <section className="p-6 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-[var(--bg-color)]" />
                            <h2 style={{ color: 'var(--bg-color)' }}className="text-2xl font-bold">1. Introduction</h2>
                        </div>
                        <p style={{ color: 'var(--bg-color)' }}className="leading-relaxed opacity-90">
                            Welcome to the AI Expense Tracker. We value your privacy and are committed to protecting your personal and financial information.
                            This Privacy Policy explains how we collect, use, and safeguard your data when you use our application.
                            By using our services, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section className="p-6 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="text-[var(--primary)]" />
                            <h2 style={{ color: 'var(--bg-color)' }}className="text-2xl font-bold">2. Information We Collect</h2>
                        </div>
                        <ul style={{ color: 'var(--bg-color)' }} className="list-disc pl-6 space-y-2 opacity-90">
                            <li><strong>Personal Identification:</strong> Name, email address, and authentication credentials.</li>
                            <li><strong>Financial Data:</strong> Expense records, budget limits, transaction categories, and spending habits.</li>
                            <li><strong>Usage Data:</strong> Interaction logs, feature usage patterns, and device information for optimization.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="text-[var(--primary)]" />
                            <h2 style={{ color: 'var(--bg-color)' }}className="text-2xl font-bold">3. How We Use Your Data</h2>
                        </div>
                        <p style={{ color: 'var(--bg-color)' }}className="mb-4 opacity-90">We use your information for the following purposes:</p>
                        <ul style={{ color: 'var(--bg-color)' }}className="list-disc pl-6 space-y-2 opacity-90">
                            <li>To provide and maintain the expense tracking service.</li>
                            <li>To generate personalized financial insights and budget recommendations using AI.</li>
                            <li>To detect anomalies in your spending patterns.</li>
                            <li>To improve user experience and application performance.</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="text-[var(--primary)]" />
                            <h2 style={{ color: 'var(--bg-color)' }}className="text-2xl font-bold">4. AI & Third-Party Services</h2>
                        </div>
                        <p style={{ color: 'var(--bg-color)' }}className="leading-relaxed opacity-90">
                            Our application utilizes advanced AI models (such as LLaMA via Groq) to provide financial coaching and analysis.
                            When you use AI features, anonymized data snippets (e.g., transaction amounts and categories) may be processed to generate responses.
                            We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section className="p-6 rounded-xl border border-[var(--border-color)]" style={{ backgroundColor: 'var(--element-bg)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-[var(--primary)]" />
                            <h2 style={{ color: 'var(--bg-color)' }}className="text-2xl font-bold">5. Data Security</h2>
                        </div>
                        <p style={{ color: 'var(--bg-color)' }}className="leading-relaxed opacity-90">
                            We implement robust security measures, including encryption and secure authentication protocols (JWT), to protect your data from unauthorized access, alteration, or disclosure.
                            However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <div className="text-center mt-12 pt-8 border-t border-[var(--border-color)]">
                        <p style={{ color: 'var(--bg-color)' }}className="mb-6 opacity-70">If you have any questions about this Privacy Policy, please contact us.</p>
                        <Link to="/" className="inline-block px-8 py-3 rounded-lg font-bold transition-transform hover:scale-105"
                            style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-color)' }}>
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
