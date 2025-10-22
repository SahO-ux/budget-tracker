import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import API from "./api";
import {
  getStoredUser,
  removeStoredToken,
  removeStoredUser,
  storeTokenInLocalStorage,
  storeUserInLocalStorage,
} from "./utils/storage";
import { fetchCategories } from "./store/actions/categoryActions";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(getStoredUser);

  const [isServerReady, setIsServerReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Please wait, server is waking up..."
  );

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || !isServerReady) return;
    dispatch(fetchCategories()).catch((err) => {
      console.error("Failed to auto-load categories on init:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isServerReady]);

  const checkHealth = useCallback(async () => {
    try {
      const res = await API.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8081"}`,
        {
          timeout: 5000, // 5 seconds timeout
        }
      );
      if (res.status === 200) {
        setStatusMessage("Server is ready!");
        setTimeout(() => setIsServerReady(true), 800); // Small delay for smoother transition
      }
    } catch (err) {
      setStatusMessage("Still waking up... please hold on!");
      checkHealth(); // keep on trying
    }
  }, []);

  const login = async ({ email, password }) => {
    if (!email?.trim() || !password?.trim())
      return toast.error(`Email & Password are required for login`);

    const { data } = await API.post("/user/login", {
      email: email?.toLowerCase()?.trim(),
      password: password?.trim(),
    });

    storeTokenInLocalStorage(data.token);
    storeUserInLocalStorage(data.user);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    removeStoredToken();
    removeStoredUser();
    setUser(null);
  };

  if (!isServerReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">{statusMessage}</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take 20–40 seconds if server was idle.
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
