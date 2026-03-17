import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function Login() {
  const { login, setAuthFromGoogle } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Role-based redirect ───────────────────────────────────────────────────
  const redirectForRole = (role) => {
    if (role === 'rescuer') navigate('/rescuer');
    else navigate('/report');
  };

  // ── Pick up Google OAuth result from URL params ──────────────────────────
  useEffect(() => {
    const token  = searchParams.get('token');
    const role   = searchParams.get('role');
    const orgRaw = searchParams.get('org');
    const err    = searchParams.get('error');

    if (err) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    if (token && role) {
      const org = orgRaw ? JSON.parse(orgRaw) : null;
      setAuthFromGoogle({ token, role, organization: org });
      redirectForRole(role);
    }
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await login(email, password);
      redirectForRole(res?.role);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect browser to backend — passport takes over from here
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card card-padding space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Welcome Back</h1>
            <p className="text-neutral-600">Sign in to your Wildlife Rescue account</p>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition-colors font-medium text-neutral-700 text-sm shadow-sm"
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.440 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-500">or sign in with email</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
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
              className="btn btn-primary btn-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-600">New to Wildlife Rescue?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link to="/register" className="btn btn-outline btn-full">
            Create an Account
          </Link>
        </div>

        <p className="text-center text-sm text-neutral-600 mt-6">
          By signing in, you agree to our terms and privacy policy
        </p>
      </div>
    </div>
  );
}