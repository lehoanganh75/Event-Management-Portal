// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import identityService from '../services/identityService';

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
    const [accounts, setAccounts] = useState([]); // Khởi tạo mảng rỗng để tránh lỗi map

    // ==================== LOAD USER PROFILE ====================
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const res = await identityService.getMyProfile();
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Token invalid or expired");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ==================== ACCOUNT MANAGEMENT (ADMIN) ====================
    
    // 1. Lấy danh sách tài khoản
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await identityService.getAllAccounts();
            setAccounts(res.data || []);
            
        } catch (e) {
            console.error("Lỗi fetchAccounts:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Cập nhật thông tin tài khoản
    const updateAccount = async (id, updateData) => {
        try {
            const res = await identityService.updateAccount(id, updateData);
            // Cập nhật state cục bộ để UI thay đổi ngay lập tức
            setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...res.data } : acc));
            return res.data;
        } catch (error) {
            console.error("Lỗi updateAccount:", error);
            throw error;
        }
    };

    // 3. Xóa tài khoản
    const deleteAccount = async (id) => {
        try {
            await identityService.deleteAccount(id);
            // Lọc bỏ tài khoản vừa xóa khỏi state
            setAccounts(prev => prev.filter(acc => acc.id !== id));
        } catch (error) {
            console.error("Lỗi deleteAccount:", error);
            throw error;
        }
    };

    // 4. Thay đổi trạng thái (Khóa/Mở khóa)
    const updateAccountStatus = async (id) => {
        const targetAccount = accounts.find(a => a.id === id);
        if (!targetAccount) return;

        // Logic toggle status: Nếu ACTIVE thì đổi sang DISABLED và ngược lại
        const newStatus = targetAccount.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

        try {
            await identityService.updateAccountStatus(id, newStatus);
            // Cập nhật state cục bộ
            setAccounts(prev => prev.map(acc => 
                acc.id === id ? { ...acc, status: newStatus } : acc
            ));
        } catch (error) {
            console.error("Lỗi updateAccountStatus:", error);
            throw error;
        }
    };

    // ==================== AUTH METHODS ====================
    const register = async (data) => {
        const res = await identityService.register(data);
        return res.data;
    };

    const login = async (credentials) => {
        const res = await identityService.login(credentials);
        const { accessToken, refreshToken, user: userData } = res.data;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        setUser(userData || null);
        setIsAuthenticated(true);
        return res.data;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) await identityService.logout(refreshToken);
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
            setAccounts([]);
        }
    };

    const forgotPassword = (email) => identityService.forgotPassword(email);
    const resetPassword = (token, newPassword) => identityService.resetPassword(token, newPassword);

    const value = {
        user,
        loading,
        isAuthenticated,
        accounts,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        loadUser,
        fetchAccounts,    // Xuất hàm này để trang Quản lý gọi khi mount
        updateAccount,    // Xuất hàm cập nhật
        deleteAccount,    // Xuất hàm xóa
        updateAccountStatus, // Xuất hàm toggle trạng thái
        identity: identityService,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};