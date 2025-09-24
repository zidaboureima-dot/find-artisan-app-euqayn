
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Simple admin credentials for demo purposes
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      console.log('Admin logged in successfully');
      return true;
    }
    console.log('Invalid admin credentials');
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    console.log('Admin logged out');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
