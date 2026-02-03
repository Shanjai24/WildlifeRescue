import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (role) localStorage.setItem('role', role);
  }, [token, role]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setRole(res.data.role);
    setOrganization(res.data.organization || null);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setOrganization(null);
  };

  const registerLover = async ({ email, password }) => {
    await api.post('/auth/register', { email, password, role: 'animal_lover' });
  };

  const registerRescuer = async ({ email, password, organization }) => {
    await api.post('/auth/register', { email, password, role: 'rescuer', organization });
  };

  return (
    <AuthContext.Provider value={{ token, role, organization, login, logout, registerLover, registerRescuer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
