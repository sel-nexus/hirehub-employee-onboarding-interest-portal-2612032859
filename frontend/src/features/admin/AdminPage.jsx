import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import AdminLogin from './AdminLogin.jsx';
import { isAuthenticated } from './adminSession.js';

/** Gates the dashboard behind the specified sessionStorage value. */
export default function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  /** Refreshes protected content after a successful static login. */
  const handleAuthenticated = () => setAuthenticated(true);
  /** Redirects to public home after session removal. */
  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/');
  };

  return authenticated ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onAuthenticated={handleAuthenticated} />;
}
