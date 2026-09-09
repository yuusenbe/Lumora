import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin, setCurrentView } = useAuth();
  const [email, setEmail] = useState('alex@lumora.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          onClick={() => setCurrentView('landing')}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#798990] hover:text-[#354546] transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5EAE3] p-2 flex items-center justify-center mx-auto shadow-sm">
          <img src="/logo_symbol_transparent.png" alt="Lumora" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#354546] tracking-tight">
          Welcome back 👋
        </h2>
        <p className="text-xs text-[#798990]">
          Check in with your energy envelope
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="lumora-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Login Button (Hackathon Highlight) */}
          <button
            type="button"
            onClick={() => demoLogin()}
            className="w-full py-3 px-4 rounded-2xl bg-[#E8EFE8] hover:bg-[#D3DCD0] border border-[#88A788]/40 text-[#354546] text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#88A788]" />
            <span>Continue as Alex Chen (1-Click Demo)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5EAE3] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#798990] uppercase font-semibold">
              or sign in
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#354546]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D3DCD0] bg-[#F8F9F3] text-xs text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#354546]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D3DCD0] bg-[#F8F9F3] text-xs text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-[#798990]">Don't have an account? </span>
            <button
              onClick={() => setCurrentView('signup')}
              className="text-xs font-bold text-[#88A788] hover:underline cursor-pointer"
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
