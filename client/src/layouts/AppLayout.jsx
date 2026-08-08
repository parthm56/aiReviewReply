import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { appsService } from '../services/apps.service';
import { StoreLogo } from '../components/StoreIcons';
import { DashboardIcon, AppsIcon, SettingsIcon, SignOutIcon, RobotSparkIcon } from '../components/NavIcons';

export default function AppLayout() {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [apps, setApps] = useState([]);

    useEffect(() => {
        appsService.list().then(r => setApps(r.data)).catch(() => {});
    }, []);

    function handleLogout() {
        logout();
        navigate('/auth/login');
    }

    const initial = auth?.user?.name?.[0]?.toUpperCase() || auth?.user?.email?.[0]?.toUpperCase() || '?';

    return (
        <div>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <RobotSparkIcon size={20} />
                    </div>
                    <div>
                        <div className="sidebar-logo-text">AI ReviewReply</div>
                        <div className="sidebar-logo-sub">Smart reply automation</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Navigation</div>

                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        <DashboardIcon size={18} /> Dashboard
                    </NavLink>

                    <NavLink to="/apps" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        <AppsIcon size={18} /> My Apps
                    </NavLink>

                    {apps.length > 0 && (
                        <>
                            <div className="sidebar-section-label" style={{marginTop: 8}}>Your Apps</div>
                            {apps.map(app => (
                                <NavLink
                                    key={app.id}
                                    to={`/apps/${app.id}`}
                                    className={({ isActive }) => `nav-link nav-app-item${isActive ? ' active' : ''}`}
                                >
                                    <StoreLogo platform={app.platform} size={16} />
                                    <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{app.name}</span>
                                    <span className={`badge badge-${app.isActive ? 'green' : 'red'}`} style={{fontSize:'9px'}}>
                                        {app.mode === 'AUTO' ? 'AUTO' : 'MAN'}
                                    </span>
                                </NavLink>
                            ))}
                        </>
                    )}

                    <div className="sidebar-section-label" style={{marginTop: 8}}>Settings</div>
                    <NavLink to="/ai-config" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        <SettingsIcon size={18} /> AI Config
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="user-chip">
                        <div className="user-avatar">{initial}</div>
                        <div style={{flex:1, minWidth:0}}>
                            <div className="user-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{auth?.user?.name || 'User'}</div>
                            <div className="user-email" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{auth?.user?.email}</div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm w-full mt-8" onClick={handleLogout} style={{justifyContent:'center'}}>
                        <SignOutIcon size={16} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Topbar */}
            <header className="topbar">
                <span className="page-title">AI ReviewReply</span>
            </header>

            {/* Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
