import { useState } from 'react';
import PropTypes from 'prop-types';
import { login } from './adminSession.js';

/** Presents the single-administrator demo login gate. */
export default function AdminLogin({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /** Attempts static credential authentication without exposing password data. */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (login(username, password)) {
      setError('');
      onAuthenticated();
      return;
    }
    setError('Invalid credentials. Please try again.');
  };

  return (
    <main className="admin-login-page">
      <form className="form-card login-card" onSubmit={handleSubmit} noValidate>
        <p className="eyebrow">ADMINISTRATOR ACCESS</p>
        <h1>Admin Login</h1>
        <p className="login-copy">Use the supplied demo credentials to manage locally stored candidate interest.</p>
        <div className="field-group">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" placeholder="Enter username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        </div>
        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button submit-button" type="submit">Login</button>
      </form>
    </main>
  );
}

AdminLogin.propTypes = { onAuthenticated: PropTypes.func.isRequired };
