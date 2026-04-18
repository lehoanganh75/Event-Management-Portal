import { login as loginService, api, injectLogout, getMyProfile } from "@/services/auth"; // Thêm api và injectLogout vào đây
import { LoginPayload } from "@/types/auth";
import { UserResponse } from "@/types/user";
import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      
      // Sửa delete thành gán undefined để an toàn với TypeScript
      api.defaults.headers.common["Authorization"] = undefined; 
      
      setUser(null);
      if (segments[0] !== "login") {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router, segments]);

  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const userData = await getMyProfile();
        setUser(userData);
      }
    } catch (error) {
      console.log("Check login failed, logging out...");
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await loginService(payload);
      if (res.accessToken) {
        await SecureStore.setItemAsync("accessToken", res.accessToken);
        if (res.refreshToken) {
          await SecureStore.setItemAsync("refreshToken", res.refreshToken);
        }
        api.defaults.headers.common["Authorization"] = `Bearer ${res.accessToken}`;
        const userData = await getMyProfile();
        setUser(userData);
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    injectLogout(logout); // Gắn hàm logout vào axios interceptor
    checkLoginStatus();
  }, [logout, checkLoginStatus]);

  // Middleware bảo vệ route
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(tabs)";
    if (!user && inAuthGroup) {
      router.replace("/login");
    } else if (user && segments[0] === "login") {
      router.replace("/(tabs)/home");
    }
  }, [user, segments, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};