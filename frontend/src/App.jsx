import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ReportIncident from './pages/ReportIncident.jsx';
import IncidentStatus from './pages/IncidentStatus.jsx';
import RescuerDashboard from './pages/RescuerDashboard.jsx';

function Nav() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🦁</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">Wildlife Rescue</span>
        </Link>

        {/* Navigation Links */}
        {role && (
          <div className="hidden md:flex items-center gap-8">
            {role === 'animal_lover' && (
              <>
              <Link to="/report" className="link-subtle text-sm font-medium">Report Incident</Link>
              <Link to="/my-incidents" className="link-subtle text-sm font-medium">My Incidents</Link>
              </>
            )}
            {role === 'rescuer' && (
              <Link to="/rescuer" className="link-subtle text-sm font-medium">Rescuer Hub</Link>
            )}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {role ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 font-medium">
                {role === 'animal_lover' ? '🐾' : '🚑'} {role === 'animal_lover' ? 'Reporter' : 'Rescuer'}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
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
      {/* Hero Section */}
      <div className="page-container flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-3xl text-center space-y-6 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-5xl">🦁</span>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-4">
              Wildlife Rescue at Scale
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Coordinate ethical and secure animal rescue operations with real-time incident tracking and AI-assisted coordination.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {!role ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Reporting
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            ) : role === 'animal_lover' ? (
              <Link to="/report" className="btn btn-primary btn-lg">
                Report an Incident
              </Link>
            ) : (
              <Link to="/rescuer" className="btn btn-primary btn-lg">
                View Rescuer Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-neutral-200">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">How It Works</h2>
            <p className="text-neutral-600">Streamlined workflow for incident reporting and rescue coordination</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-padding text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Report Location</h3>
              <p className="text-neutral-600">Quickly report wildlife incidents with GPS coordinates and details</p>
            </div>

            {/* Feature 2 */}
            <div className="card card-padding text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Track Status</h3>
              <p className="text-neutral-600">Monitor incident status in real-time with priority-based alerts</p>
            </div>

            {/* Feature 3 */}
            <div className="card card-padding text-center">
              <div className="text-4xl mb-4">🤝</div>
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/my-incidents" element={<IncidentStatus />} />
        <Route path="/rescuer" element={<RescuerDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
