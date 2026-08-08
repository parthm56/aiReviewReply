import { Outlet } from 'react-router-dom';
import { RobotSparkIcon } from '../components/NavIcons';

export default function AuthLayout() {
    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <RobotSparkIcon size={24} />
                    </div>
                    <div className="auth-title">AI ReviewReply</div>
                    <div className="auth-sub">Automate your app store review responses</div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
