import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import { LoginPage, RegisterPage } from '../modules/auth';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import AppsPage from '../modules/apps/pages/AppsPage';
import AppDetailPage from '../modules/apps/pages/AppDetailPage';
import AiConfigPage from '../modules/ai-config/pages/AiConfigPage';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="login" replace /> },
            { path: 'login',    element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ]
    },
    {
        path: '/',
        element: <PrivateRoute><AppLayout /></PrivateRoute>,
        children: [
            { index: true,         element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard',   element: <DashboardPage /> },
            { path: 'apps',        element: <AppsPage /> },
            { path: 'apps/:id',    element: <AppDetailPage /> },
            { path: 'ai-config',   element: <AiConfigPage /> },
        ]
    },
    { path: '*', element: <Navigate to="/" replace /> }
]);

export default router;
