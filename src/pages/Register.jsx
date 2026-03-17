import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function Register() {
  const { registerLover, registerRescuer } = useAuth();
  const [type, setType] = useState('animal_lover');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState({
    name: '',
    serviceType: 'wildlife_center',
    city: '',
    district: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setError(null);
    setIsLoading(true);
    try {
      if (type === 'animal_lover') {
        await registerLover({ email, password });
        setSuccessMsg('Account created! Logging you in...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        await registerRescuer({ email, password, organization: org });
        setSuccessMsg('Organization registered! Logging you in...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-neutral-50 to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="card card-padding space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Join Wildlife Rescue</h1>
            <p className="text-neutral-600">Create your account and start making a difference</p>
          </div>

          {/* Account Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Animal Lover Option */}
            <button
              type="button"
              onClick={() => setType('animal_lover')}
              className={`p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
                type === 'animal_lover'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="text-3xl mb-2">🐾</div>
              <h3 className="font-semibold text-neutral-900 mb-1">Report Incidents</h3>
              <p className="text-xs text-neutral-600">Wildlife encountering help</p>
            </button>

            {/* Rescuer Option */}
            <button
              type="button"
              onClick={() => setType('rescuer')}
              className={`p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
                type === 'rescuer'
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="text-3xl mb-2">🚑</div>
              <h3 className="font-semibold text-neutral-900 mb-1">Rescue Organization</h3>
              <p className="text-xs text-neutral-600">Respond to rescue requests</p>
            </button>
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="alert alert-success">
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">

            {/* ── Animal Lover: email + password outside ── */}
            {type === 'animal_lover' && (
              <>
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
              </>
            )}

            {/* ── Rescue Organization: everything inside one box ── */}
            {type === 'rescuer' && (
              <div className="space-y-4 p-4 bg-accent-50 rounded-lg">
                <h3 className="font-semibold text-neutral-900">Organization Details</h3>

                {/* Organization Name */}
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Wildlife Rescue Central"
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    required
                  />
                </div>

                {/* Account Email — moved inside for rescuer */}
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

                {/* Password — moved inside for rescuer */}
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

                {/* Service Type */}
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select
                    className="form-select"
                    value={org.serviceType}
                    onChange={(e) => setOrg({ ...org, serviceType: e.target.value })}
                    required
                  >
                    <option value="wildlife_center">Wildlife Center</option>
                    <option value="veterinary">Veterinary Clinic</option>
                    <option value="blue_cross">Animal Welfare (Blue Cross)</option>
                    <option value="firefighter">Emergency Services</option>
                  </select>
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="City"
                      value={org.city}
                      onChange={(e) => setOrg({ ...org, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="District"
                      value={org.district}
                      onChange={(e) => setOrg({ ...org, district: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                      value={org.contactPhone}
                      onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="contact@org.com"
                      value={org.contactEmail}
                      onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-600">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="btn btn-outline btn-full"
          >
            Sign In Instead
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-neutral-600 mt-6">
          By registering, you agree to our terms and privacy policy
        </p>
      </div>
    </div>
  );
}