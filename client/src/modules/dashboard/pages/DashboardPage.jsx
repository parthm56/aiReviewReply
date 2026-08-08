import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appsService } from '../../../services/apps.service';
import { useAuth } from '../../../context/AuthContext';
import { StoreLogo } from '../../../components/StoreIcons';

export default function DashboardPage() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ apps: 0, autoApps: 0, reviews: 0, published: 0 });
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        appsService.list().then(async ({ data }) => {
            setApps(data);
            const autoCount = data.filter(a => a.mode === 'AUTO' && a.isActive).length;
            const totalReviews = data.reduce((s, a) => s + (a._count?.reviews || 0), 0);
            setStats({ apps: data.length, autoApps: autoCount, reviews: totalReviews, published: 0 });
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const greeting = auth?.user?.name ? `Hello, ${auth.user.name.split(' ')[0]}! 👋` : 'Dashboard';

    return (
        <div>
            <div className="section-header mb-20">
                <h1 style={{fontSize:24}}>{greeting}</h1>
                <button className="btn btn-primary" onClick={() => navigate('/apps')}>+ Add App</button>
            </div>

            {/* Stat cards */}
            <div className="stat-grid mb-20">
                {[
                    { label: 'Connected Apps',   value: stats.apps,      icon: '📱', color: 'var(--accent)' },
                    { label: 'Auto Mode Active',  value: stats.autoApps,  icon: '🤖', color: 'var(--green)' },
                    { label: 'Total Reviews',     value: stats.reviews,   icon: '⭐', color: 'var(--yellow)' },
                    { label: 'Replies Published', value: stats.published, icon: '✅', color: 'var(--blue)' },
                ].map(s => (
                    <div key={s.label} className="card stat-card" style={{'--accent': s.color}}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{loading ? '—' : s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent apps */}
            <div className="section-header">
                <h3>Your Apps</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/apps')}>View all</button>
            </div>

            {loading ? (
                <div className="empty-state"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>
            ) : apps.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📱</div>
                    <p className="empty-text">No apps connected yet.</p>
                    <button className="btn btn-primary mt-16" onClick={() => navigate('/apps')}>Connect your first app</button>
                </div>
            ) : (
                <div className="app-grid">
                    {apps.slice(0, 6).map(app => (
                        <div key={app.id} className="card app-card card-hover" onClick={() => navigate(`/apps/${app.id}`)}>
                            <div className="flex items-center gap-12 mb-12">
                                <div className={`app-platform-icon ${app.platform === 'PLAYSTORE' ? 'app-platform-play' : 'app-platform-apple'}`}>
                                    <StoreLogo platform={app.platform} size={22} />
                                </div>
                                <div>
                                    <div style={{fontWeight:600,color:'var(--text-heading)',fontSize:14}}>{app.name}</div>
                                    <div className="text-sm text-muted">{app.platform}</div>
                                </div>
                                <div style={{marginLeft:'auto',display:'flex',gap:4}}>
                                    <span className={`badge badge-${app.isActive ? 'green' : 'red'}`}>
                                        {app.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className={`badge badge-${app.mode === 'AUTO' ? 'purple' : 'blue'}`}>
                                        {app.mode}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-muted">{app._count?.reviews || 0} reviews</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

