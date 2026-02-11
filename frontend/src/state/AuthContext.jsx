import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Change from localStorage to sessionStorage
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [role, setRole] = useState(sessionStorage.getItem('role'));
  const [organization, setOrganization] = useState(
    sessionStorage.getItem('organization') 
      ? JSON.parse(sessionStorage.getItem('organization')) 
      : null
  );

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
    if (role) {
      sessionStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('role');
    }
    if (organization) {
      sessionStorage.setItem('organization', JSON.stringify(organization));
    } else {
      sessionStorage.removeItem('organization');
    }
  }, [token, role, organization]);

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
    sessionStorage.clear();
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