import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../lib/mockData';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  switchAccount: (userId: string) => void;
  promoteUser: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('evm_users_list');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Default to null so any new visitor must log in first before entering the panel
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('evm_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('evm_user_passwords');
      return saved
        ? JSON.parse(saved)
        : {
            'admin@evmpanel.io': 'admin',
            'admin': 'admin',
            'user@evmpanel.io': 'user',
            'user': 'user',
          };
    } catch {
      return {
        'admin@evmpanel.io': 'admin',
        'admin': 'admin',
        'user@evmpanel.io': 'user',
        'user': 'user',
      };
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('evm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('evm_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('evm_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('evm_user_passwords', JSON.stringify(passwordsMap));
  }, [passwordsMap]);

  const login = (identifier: string, pass: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter both username/email and password.' };
    }

    // 1. ADMIN Authentication: username "admin" (or "admin@evmpanel.io") with password "admin" (or "admin123")
    if (
      (cleanId === 'admin' || cleanId === 'admin@evmpanel.io' || cleanId === 'root') &&
      (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'admin@123' || cleanPass === 'root')
    ) {
      const adminUser = usersList.find((u) => u.role === 'ADMIN') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
      return { success: true };
    }

    // 2. Demo Normal User: username "user" or "user@evmpanel.io" with password "user" or "user123"
    if (
      (cleanId === 'user' || cleanId === 'user@evmpanel.io') &&
      (cleanPass === 'user' || cleanPass === 'user123')
    ) {
      const normalUser = usersList.find((u) => u.role === 'USER') || INITIAL_USERS[1];
      setCurrentUser(normalUser);
      return { success: true };
    }

    // 3. Check registered custom users
    const matchedUser = usersList.find(
      (u) => u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId
    );

    if (matchedUser) {
      const storedPass = passwordsMap[matchedUser.email.toLowerCase()] || passwordsMap[matchedUser.name.toLowerCase()];
      if (storedPass && storedPass !== cleanPass) {
        return { success: false, message: 'Incorrect password for this user account.' };
      }
      setCurrentUser(matchedUser);
      return { success: true };
    }

    // 4. Auto-register new regular user if logging in with new non-admin credentials
    const isTryingAdmin = cleanId.includes('admin') || cleanId.includes('root');
    if (!isTryingAdmin) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : identifier.trim(),
        email: cleanId.includes('@') ? cleanId : `${cleanId}@evm.local`,
        role: 'USER', // Standard user only
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanId)}`,
        createdAt: new Date().toISOString(),
      };
      setUsersList((prev) => [...prev, newUser]);
      setPasswordsMap((prev) => ({ ...prev, [newUser.email.toLowerCase()]: cleanPass, [newUser.name.toLowerCase()]: cleanPass }));
      setCurrentUser(newUser);
      return { success: true, message: 'Welcome! New user account created.' };
    }

    return {
      success: false,
      message: 'Invalid credentials. For Admin panel access, use username: admin & password: admin.',
    };
  };

  const register = (name: string, emailOrUser: string, pass: string): { success: boolean; message?: string } => {
    const cleanId = emailOrUser.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = name.trim();

    if (!cleanName || !cleanId || !cleanPass) {
      return { success: false, message: 'Please provide all required fields.' };
    }

    // Check if trying to register as admin name
    if (cleanId === 'admin' || cleanName.toLowerCase() === 'admin' || cleanId === 'admin@evmpanel.io') {
      return {
        success: false,
        message: 'Admin account already exists. Please sign in with username: admin & password: admin.',
      };
    }

    if (usersList.some((u) => u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, message: 'An account with this username/email already exists. Please login.' };
    }

    const email = cleanId.includes('@') ? cleanId : `${cleanId}@evm.local`;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: email,
      role: 'USER', // Strict USER role
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      createdAt: new Date().toISOString(),
    };

    setUsersList((prev) => [...prev, newUser]);
    setPasswordsMap((prev) => ({
      ...prev,
      [newUser.email.toLowerCase()]: cleanPass,
      [newUser.name.toLowerCase()]: cleanPass,
    }));
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('evm_current_user');
  };

  const switchAccount = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const promoteUser = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isAdmin: currentUser?.role === 'ADMIN',
        isLoggedIn: currentUser !== null,
        login,
        register,
        logout,
        switchAccount,
        promoteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
