import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AUTH_KEY = 'hirehub_admin_auth';

/** Renders the shared sticky navigation and reacts to administrator session changes. */
export default function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.sessionStorage.getItem(AUTH_KEY) === 'true',
  );

  useEffect(() => {
    /** Synchronizes visual session state after a local login or logout. */
    const syncAuth = () => setIsAuthenticated(window.sessionStorage.getItem(AUTH_KEY) === 'true');
    window.addEventListener('hirehub:auth-change', syncAuth);
    return () => window.removeEventListener('hirehub:auth-change', syncAuth);
  }, []);

  /** Clears the demo session and returns the administrator to the public route. */
  const handleLogout = () => {
    window.sessionStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('hirehub:auth-change'));
    navigate('/');
  };

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="HireHub home">
        HireHub
      </NavLink>
      <nav className="main-nav" aria-label="Primary navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/apply">Apply</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      {isAuthenticated ? (
        <button className="logout-button" type="button" onClick={handleLogout}>Logout</button>
      ) : (
        <NavLink className="login-link" to="/admin">Login</NavLink>
      )}
    </header>
  );
}
