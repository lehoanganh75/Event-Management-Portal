// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService'; // SỬA: Dùng authService

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accounts, setAccounts] = useState([]);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await authService.getMyProfile(); // SỬA: authService
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Session expired");
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Admin: Fetch danh sách account
    const fetchAccounts = useCallback(async () => {
        try {
            const res = await authService.getAllAccounts();
            setAccounts(res.data || []);
        } catch (e) {
            console.error("Lỗi fetchAccounts:", e);
        }
    }, []);

    const updateAccount = async (id, updateData) => {
        const res = await authService.updateAccount(id, updateData);
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...res.data } : acc));
        return res.data;
    };

    const deleteAccount = async (id) => {
        await authService.deleteAccount(id);
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const updateAccountStatus = async (id) => {
        const targetAccount = accounts.find(a => a.id === id);
        if (!targetAccount) return;

        const newStatus = targetAccount.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
        try {
            await authService.updateAccountStatus(id, newStatus);
            // Cập nhật state UI
            setAccounts(prev => prev.map(acc => 
                acc.id === id ? { ...acc, status: newStatus } : acc
            ));
        } catch (error) {
            throw error;
        }
    };

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        const { accessToken, refreshToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        // Sau khi login thành công, gọi lấy profile để đảm bảo dữ liệu user đầy đủ
        const profileRes = await authService.getMyProfile();
        setUser(profileRes.data);
        setIsAuthenticated(true);
        return res.data;
    };

    const logout = async () => {
        try {
            const rt = localStorage.getItem('refreshToken');
            if (rt) await authService.logout(rt);
        } finally {
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
            setAccounts([]);
        }
    };

    const value = {
        user, loading, isAuthenticated, accounts,
        register: authService.register,
        login, logout, fetchAccounts, updateAccount,
        deleteAccount, updateAccountStatus,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
        authService // Export toàn bộ service nếu cần dùng trực tiếp
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};