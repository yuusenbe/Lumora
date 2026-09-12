import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-[#EDF3EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#E3F2E9] selection:text-[#152F26]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          onClick={() => setCurrentView('landing')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#4A675E] hover:text-[#152F26] transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#1F6B4F] p-3 flex items-center justify-center mx-auto shadow-sm">
          <img src="/logo_symbol_transparent.png" alt="Lumora" className="w-full h-full object-contain brightness-0 invert" />
        </div>

        <h2 className="text-2xl font-bold text-[#152F26] tracking-tight font-display">
          Welcome back
        </h2>
        <p className="text-xs text-[#4A675E]">
          Check in with your cognitive energy envelope
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="lumora-card p-6 sm:p-8 space-y-5 bg-white border border-[#D2E2D8] shadow-lg">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Login Button */}
          <button
            type="button"
            onClick={() => demoLogin()}
            className="w-full py-3 px-4 rounded-xl bg-[#E3F2E9] hover:bg-[#C2E2D0]/60 border border-[#C2E2D0] text-[#152F26] text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#1F6B4F]" />
            <span>Continue as Alex Chen (1-Click Demo)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#D2E2D8] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#4A675E] uppercase font-semibold">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#152F26]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2E2D8] bg-[#EDF3EE] text-xs text-[#152F26] focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#152F26]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2E2D8] bg-[#EDF3EE] text-xs text-[#152F26] focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#D2E2D8]">
            <span className="text-xs text-[#4A675E]">Don't have an account? </span>
            <button
              onClick={() => setCurrentView('signup')}
              className="text-xs font-semibold text-[#1F6B4F] hover:text-[#16533D] hover:underline cursor-pointer ml-1"
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
