import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../components/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user is already logged in from local storage or cookies
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ notification_shown: false })
        .eq('id', user.id);

      if (error) {
        console.error('Error resetting notification shown status:', error);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
