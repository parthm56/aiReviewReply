import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../context/AuthContext';

export default function RegisterForm() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await authService.register(form.name, form.email, form.password);
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    const set = key => e => setForm(p => ({...p, [key]: e.target.value}));

    return (
        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="register-name" type="text" className="form-input" placeholder="John Doe"
                    value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
                <label className="form-label">Email</label>
                <input id="register-email" type="email" className="form-input" placeholder="you@example.com"
                    value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input id="register-password" type="password" className="form-input" placeholder="Min 8 characters"
                    value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button id="register-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <><span className="spinner"/> Creating account…</> : 'Create Account'}
            </button>
            <div className="auth-footer">
                Already have an account? <Link to="/auth/login">Sign in</Link>
            </div>
        </form>
    );
}