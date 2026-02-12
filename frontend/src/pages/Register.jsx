import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nature-leaf">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707" />
  </svg>
);

const UserHeartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M12 11c1-1 3 0 0 3-3-3-1-4 0-3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

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
        setSuccessMsg('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        await registerRescuer({ email, password, organization: org });
        setSuccessMsg('Organization registered! Your account is pending verification.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-nature-soft/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-nature-clay/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-3xl relative z-10">
        <div className="card card-padding space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-nature-cream rounded-2xl flex items-center justify-center border border-nature-soft/20 shadow-soft">
                <SparkleIcon />
              </div>
            </div>
            <h1 className="text-4xl font-black text-nature-slate tracking-tight">Join the Mission</h1>
            <p className="text-lg text-nature-slate/60">Choose your role and start protecting wildlife today</p>
          </div>

          {/* Account Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setType('animal_lover')}
              className={`group p-8 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${
                type === 'animal_lover'
                  ? 'border-nature-soft bg-nature-cream/30 shadow-soft'
                  : 'border-nature-soft/10 bg-white hover:border-nature-soft/30 hover:bg-nature-bg'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                type === 'animal_lover' ? 'bg-nature-soft text-white' : 'bg-nature-cream text-nature-leaf'
              }`}>
                <UserHeartIcon />
              </div>
              <h3 className="text-xl font-bold text-nature-slate mb-2">Advocate</h3>
              <p className="text-sm text-nature-slate/50 leading-relaxed">Report incidents and track local wildlife encounters.</p>
              {type === 'animal_lover' && (
                <div className="absolute top-4 right-4 text-nature-soft">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="opacity-20" />
                    <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setType('rescuer')}
              className={`group p-8 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${
                type === 'rescuer'
                  ? 'border-nature-clay bg-nature-clay/5 shadow-soft'
                  : 'border-nature-soft/10 bg-white hover:border-nature-soft/30 hover:bg-nature-bg'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                type === 'rescuer' ? 'bg-nature-clay text-white' : 'bg-nature-clay/10 text-nature-clay'
              }`}>
                <ShieldIcon />
              </div>
              <h3 className="text-xl font-bold text-nature-slate mb-2">Professional</h3>
              <p className="text-sm text-nature-slate/50 leading-relaxed">Verified rescue organizations and veterinary clinics.</p>
              {type === 'rescuer' && (
                <div className="absolute top-4 right-4 text-nature-clay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="opacity-20" />
                    <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {(successMsg || error) && (
            <div className={`px-8 py-4 rounded-2xl border-2 text-center font-bold ${
              successMsg ? 'bg-nature-soft/10 border-nature-soft/20 text-nature-leaf' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {successMsg || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <label className="form-label">Create Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Rescuer Organization Fields */}
            {type === 'rescuer' && (
              <div className="space-y-10 p-10 bg-nature-bg rounded-[2.5rem] border-2 border-nature-soft/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-nature-soft text-white rounded-full flex items-center justify-center font-black">2</div>
                  <h3 className="text-2xl font-black text-nature-slate uppercase tracking-tight">Organization Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Eco-Rescue Global"
                      value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">Service Type</label>
                    <select
                      className="form-select"
                      value={org.serviceType}
                      onChange={(e) => setOrg({ ...org, serviceType: e.target.value })}
                      required
                    >
                      <option value="wildlife_center">Wildlife Sanctuary</option>
                      <option value="veterinary">Modern Veterinary Care</option>
                      <option value="blue_cross">Animal Rights Org</option>
                      <option value="firefighter">Rapid Response Unit</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">City / Region</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="City"
                      value={org.city}
                      onChange={(e) => setOrg({ ...org, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">Postal District</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="District"
                      value={org.district}
                      onChange={(e) => setOrg({ ...org, district: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">Emergency Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                      value={org.contactPhone}
                      onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">Public Contact Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="rescue@organization.org"
                      value={org.contactEmail}
                      onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 text-xl"
            >
              {isLoading ? 'Establishing Identity...' : 'Register as Wildlife Partner'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="flex flex-col gap-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-nature-soft/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white text-nature-slate/40 font-bold uppercase tracking-widest">Already a partner?</span>
              </div>
            </div>

            <Link
              to="/login"
              className="btn-outline w-full py-4 text-lg"
            >
              Secure Partner Login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-nature-slate/40 mt-12 font-medium">
          By joining, you help protect 25,000+ endangered species worldwide.
        </p>
      </div>
    </div>
  );
}
