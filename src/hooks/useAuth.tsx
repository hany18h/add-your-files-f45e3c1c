import { useState, createContext, useContext, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setSession({ user: parsedUser });
      setIsAdmin(parsedUser.email === ADMIN_EMAIL);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return { error: new Error('Email already registered') };
    }

    const newUser = { 
      id: Date.now().toString(), 
      email, 
      password,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = { 
        id: 'admin', 
        email: ADMIN_EMAIL,
        created_at: new Date().toISOString()
      };
      setUser(adminUser);
      setSession({ user: adminUser });
      setIsAdmin(true);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return { error: null };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { error: new Error('Invalid email or password') };
    }

    const userData = { id: foundUser.id, email: foundUser.email, created_at: foundUser.created_at };
    setUser(userData);
    setSession({ user: userData });
    setIsAdmin(false);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
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
