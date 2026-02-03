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
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">Animal Rescue</Link>
        <div className="flex items-center gap-4">
          <Link to="/report" className="text-sm">Report</Link>
          <Link to="/my-incidents" className="text-sm">My Incidents</Link>
          <Link to="/rescuer" className="text-sm">Rescuer</Link>
          {role ? (
            <button
              className="px-3 py-1 rounded bg-gray-100"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">AI-Assisted Animal Rescue</h1>
      <p className="text-gray-600">Report incidents, track status, and coordinate rescues ethically and securely.</p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen">
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
