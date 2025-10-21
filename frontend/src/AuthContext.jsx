import { createContext, useEffect, useState } from "react";
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

  useEffect(() => {
    if (!user) return;

    dispatch(fetchCategories()).catch((err) => {
      console.error("Failed to auto-load categories on init:", err);
    });
  }, [user]);

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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
