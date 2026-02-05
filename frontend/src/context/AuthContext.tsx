import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { account } from "@/lib/appwrite";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  checkSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      await account.get(); // Check if user is logged in
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};