import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup, demoLogin, setCurrentView } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
          Let's make your week lighter.
        </h2>
        <p className="text-xs text-[#798990]">
          Create your personalized burnout autopilot account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="lumora-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#354546]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D3DCD0] bg-[#F8F9F3] text-xs text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#354546]">Student Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
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
                placeholder="••••••••"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-[#D3DCD0] bg-[#F8F9F3] text-xs text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5EAE3] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#798990] uppercase font-semibold">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => demoLogin()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#E8EFE8] hover:bg-[#D3DCD0] border border-[#88A788]/40 text-[#354546] text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#88A788]" />
            <span>Try Instant Demo (Alex Chen)</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-[#798990]">Already have an account? </span>
            <button
              onClick={() => setCurrentView('login')}
              className="text-xs font-bold text-[#88A788] hover:underline cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
