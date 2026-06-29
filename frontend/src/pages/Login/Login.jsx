import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('sana@riskpro.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Run backend seed first.');
    }
  }

  return (
    <div className="login-screen">
      <section className="login-card">
        <div className="login-brand"><span>⚠</span><div><strong>RiskPro Sana</strong><p>AI-Powered Risk Management System</p></div></div>
        <h1>Welcome back</h1>
        <p>Use the seeded manager account to test every feature.</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@riskpro.com" /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password123" /></label>
          <button className="button primary full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </section>
    </div>
  );
}
