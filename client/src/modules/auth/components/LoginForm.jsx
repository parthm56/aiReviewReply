import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../context/AuthContext';

export default function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await authService.login(form.email, form.password);
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
                <label className="form-label">Email</label>
                <input id="login-email" type="email" className="form-input" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input id="login-password" type="password" className="form-input" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <><span className="spinner"/> Signing in…</> : 'Sign In'}
            </button>
            <div className="auth-footer">
                Don't have an account? <Link to="/auth/register">Create one</Link>
            </div>
        </form>
    );
}