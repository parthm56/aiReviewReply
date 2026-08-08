import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return token ? { token, user: user ? JSON.parse(user) : null } : null;
    });

    function login(user, token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuth({ user, token });
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(null);
    }

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
