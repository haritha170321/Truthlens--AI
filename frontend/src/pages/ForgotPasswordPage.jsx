import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      // safe simulated fallback
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-semibold">Reset Link Dispatched</p>
            <p>If an account with {email} exists, password reset instructions have been forwarded to your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
