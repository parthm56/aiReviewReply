import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appsService } from '../../../services/apps.service';
import { StoreLogo } from '../../../components/StoreIcons';

export default function AppsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const navigate = useNavigate();

    function load() {
        appsService.list().then(r => setApps(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
    useEffect(load, []);

    async function handleDelete(e, id) {
        e.stopPropagation();
        if (!confirm('Delete this app and all its reviews?')) return;
        await appsService.remove(id);
        setApps(a => a.filter(x => x.id !== id));
    }

    async function handleToggle(e, app) {
        e.stopPropagation();
        const { data } = await appsService.update(app.id, { isActive: !app.isActive });
        setApps(a => a.map(x => x.id === app.id ? {...x, isActive: data.isActive} : x));
    }

    return (
        <div>
            <div className="section-header">
                <h2>My Apps</h2>
                <button className="btn btn-primary" id="add-app-btn" onClick={() => setShowAdd(true)}>+ Connect App</button>
            </div>

            {loading ? (
                <div className="empty-state"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>
            ) : apps.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📱</div>
                    <p className="empty-text">No apps connected yet.</p>
                    <button className="btn btn-primary mt-16" onClick={() => setShowAdd(true)}>Connect your first app</button>
                </div>
            ) : (
                <div className="app-grid">
                    {apps.map(app => (
                        <div key={app.id} className="card app-card card-hover" onClick={() => navigate(`/apps/${app.id}`)}>
                            <div className="flex items-center gap-12">
                                <div className={`app-platform-icon ${app.platform === 'PLAYSTORE' ? 'app-platform-play' : 'app-platform-apple'}`}>
                                    <StoreLogo platform={app.platform} size={22} />
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{fontWeight:600, color:'var(--text-heading)', fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{app.name}</div>
                                    <div className="text-sm text-muted" style={{marginTop:4}}>{app.platform === 'PLAYSTORE' ? 'Google Play Store' : 'Apple App Store'} · {app._count?.reviews || 0} reviews</div>
                                </div>
                            </div>

                            <div className="flex gap-8" style={{marginTop:12, flexWrap:'wrap'}}>
                                <span className={`badge badge-${app.isActive ? 'green' : 'red'}`}>{app.isActive ? '● Active' : '● Inactive'}</span>
                                <span className={`badge badge-${app.mode === 'AUTO' ? 'purple' : 'blue'}`}>{app.mode} Mode</span>
                            </div>
                            <div className="flex gap-8" style={{marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)'}}>
                                <button className="btn btn-ghost btn-sm" onClick={e => handleToggle(e, app)}>
                                    {app.isActive ? '⏸ Deactivate' : '▶ Activate'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(e, app.id)}>🗑 Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAdd && (
                <AddAppModal
                    onClose={() => setShowAdd(false)}
                    onCreated={app => { setApps(a => [...a, app]); setShowAdd(false); navigate(`/apps/${app.id}`); }}
                />
            )}
        </div>
    );
}

function AddAppModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', platform: 'PLAYSTORE', credentials: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.credentials) { setError('Credentials are required'); return; }
        try { JSON.parse(form.credentials); } catch { setError('Credentials must be valid JSON'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await appsService.create(form);
            onCreated(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to connect app');
        } finally { setLoading(false); }
    }

    const credPlaceholder = form.platform === 'PLAYSTORE'
        ? '{\n  "packageName": "com.example.app",\n  "type": "service_account",\n  ...\n}'
        : '{\n  "appId": "123456789",\n  "issuerId": "...",\n  "keyId": "...",\n  "privateKey": "..."\n}';

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup" style={{maxWidth:520}} onClick={e => e.stopPropagation()}>
                <div className="popup-title">Connect New App</div>
                <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16,marginTop:16}}>
                    <div className="form-group">
                        <label className="form-label">App Name</label>
                        <input className="form-input" placeholder="My Awesome App" value={form.name} onChange={set('name')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Platform</label>
                        <select className="form-select" value={form.platform} onChange={set('platform')}>
                            <option value="PLAYSTORE">▶ Google Play Store</option>
                            <option value="APPSTORE">🍎 Apple App Store</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Credentials (JSON)</label>
                        <textarea className="form-textarea" style={{minHeight:120,fontFamily:'monospace',fontSize:12}}
                            placeholder={credPlaceholder} value={form.credentials} onChange={set('credentials')} />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    <div className="popup-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner"/> Connecting…</> : 'Connect App'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
