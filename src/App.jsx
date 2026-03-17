import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ReportIncident from './pages/ReportIncident.jsx';
import IncidentStatus from './pages/IncidentStatus.jsx';
import RescuerDashboard from './pages/RescuerDashboard.jsx';
import ConservationDashboard from './pages/ConservationDashboard.jsx';
import PredictiveInsights from './pages/PredictiveInsights.jsx';

// ── Route guards ─────────────────────────────────────────────────────────────

// Only animal_lovers — rescuers get bounced to /rescuer
function AnimalLoverRoute({ children }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" />;
  if (role === 'rescuer') return <Navigate to="/rescuer" />;
  return children;
}

// Only rescuers — animal_lovers get bounced to /report
function RescuerRoute({ children }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" />;
  if (role === 'animal_lover') return <Navigate to="/report" />;
  return children;
}

// Any logged-in user
function ProtectedRoute({ children }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" />;
  return children;
}

function Nav() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🦁</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
            Wildlife Rescue
          </span>
        </Link>

        {/* Center nav links — all in one flat flex row */}
        {role && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/analytics" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1">
              🧭 Conservation
            </Link>
            <Link to="/predictive" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1">
              📊 Insights
            </Link>
            {role === 'animal_lover' && (
              <>
                <Link to="/report" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                  Report Incident
                </Link>
                <Link to="/my-incidents" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                  My Incidents
                </Link>
              </>
            )}
            {role === 'rescuer' && (
              <Link to="/rescuer" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                Rescuer Hub
              </Link>
            )}
          </div>
        )}

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {role ? (
            <>
              <span className="text-sm text-neutral-600 font-medium">
                {role === 'animal_lover' ? '🐾 Reporter' : '🚑 Rescuer'}
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm hover:text-white">Get Started</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

function Home() {
  const { role } = useAuth();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-neutral-50 via-primary-50 to-accent-50">
      {/* Hero */}
      <div className="page-container flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-3xl text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🦁</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Wildlife Rescue at Scale
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Coordinate ethical and secure animal rescue operations with real-time incident tracking and AI-assisted coordination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {!role ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg hover:text-white">Start Reporting</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
              </>
            ) : role === 'animal_lover' ? (
              <Link to="/report" className="btn btn-primary btn-lg hover:text-white">Report an Incident</Link>
            ) : (
              <Link to="/rescuer" className="btn btn-primary btn-lg hover:text-white">View Rescuer Dashboard</Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-t border-neutral-200">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">How It Works</h2>
            <p className="text-neutral-600">Streamlined workflow for incident reporting and rescue coordination</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card card-padding text-center">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Report Location</h3>
              <p className="text-neutral-600">Quickly report wildlife incidents with GPS coordinates and details</p>
            </div>
            <div className="card card-padding text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Track Status</h3>
              <p className="text-neutral-600">Monitor incident status in real-time with priority-based alerts</p>
            </div>
            <div className="card card-padding text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Coordinate Rescue</h3>
              <p className="text-neutral-600">Connect with verified rescue organizations for swift response</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav />
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />

        {/* Animal lover only */}
        <Route path="/report"       element={<AnimalLoverRoute><ReportIncident /></AnimalLoverRoute>} />
        <Route path="/my-incidents" element={<AnimalLoverRoute><IncidentStatus /></AnimalLoverRoute>} />

        {/* Rescuer only */}
        <Route path="/rescuer"      element={<RescuerRoute><RescuerDashboard /></RescuerRoute>} />

        {/* Any logged-in user */}
        <Route path="/analytics"    element={<ProtectedRoute><ConservationDashboard /></ProtectedRoute>} />
        <Route path="/predictive"   element={<ProtectedRoute><PredictiveInsights /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;