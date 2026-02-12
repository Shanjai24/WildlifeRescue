import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

const LeafIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nature-leaf">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1.8 8.2a7 7 0 0 1-9.8 9.8Z" />
    <path d="M11 20l5-5" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/report');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-nature-soft/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-nature-clay/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="card card-padding space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-nature-cream rounded-2xl flex items-center justify-center border border-nature-soft/20 shadow-soft">
                <LeafIcon />
              </div>
            </div>
            <h1 className="text-4xl font-black text-nature-slate tracking-tight">Welcome Back</h1>
            <p className="text-lg text-nature-slate/60">Sign in to your Wildlife Conservation account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-2 border-red-100 rounded-2xl">
              <p className="text-red-700 font-bold text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {isLoading ? 'Processing...' : 'Secure Sign In'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="flex flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-nature-soft/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white text-nature-slate/40 font-bold uppercase tracking-widest">New here?</span>
              </div>
            </div>

            <Link
              to="/register"
              className="btn-outline w-full py-4 text-lg"
            >
              Create Member Account
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-nature-slate/40 mt-10 font-medium">
          Protected by Wildlife AI Security Protocol
        </p>
      </div>
    </div>
  );
}
