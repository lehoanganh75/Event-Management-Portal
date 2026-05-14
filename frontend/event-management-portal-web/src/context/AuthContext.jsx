// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import eventService from '../services/eventService';

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
            // Sử dụng _silent: true để tránh redirect sang /login nếu token hết hạn
            const res = await authService.getMyProfile({ _silent: true });
            const profileData = res.data;

            // Fetch organizer roles if available
            try {
                const rolesRes = await eventService.getOrganizerRoles();
                profileData.eventRoles = rolesRes || [];
            } catch (e) {
                profileData.eventRoles = [];
            }

            setUser(profileData);
            setIsAuthenticated(true);
        } catch (error) {
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

    // ==================== HÀNH ĐỘNG XÁC THỰC ====================
    const login = async (credentials) => {
        // 1. Gọi login qua publicIdentity (Không cần token)
        const res = await authService.login(credentials);
        const { accessToken, refreshToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        // 2. Sau khi có token, lấy profile đầy đủ qua privateIdentity
        const profileRes = await authService.getMyProfile();
        const profileData = profileRes.data;

        // Fetch organizer roles
        try {
            const rolesRes = await eventService.getOrganizerRoles();
            profileData.eventRoles = rolesRes || [];
        } catch (e) {
            profileData.eventRoles = [];
        }

        setUser(profileData);
        setIsAuthenticated(true);
        return res.data;
    };

    const register = async (userData) => {
        try {
            const res = await authService.register(userData);

            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await authService.logout(refreshToken);
        } catch (e) {
        } finally {
            // Luôn xóa sạch dữ liệu ở Client bất kể API thành công hay thất bại
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
            setAccounts([]);
        }
    };

    // ==================== QUẢN LÝ TÀI KHOẢN (ADMIN) ====================
    const fetchAccounts = useCallback(async () => {
        try {
            const res = await authService.getAllAccounts();
            setAccounts(res.data || []);
        } catch (e) {
        }
    }, []);

    const updateAccount = async (id, updateData) => {
        // 1. Cập nhật profile cơ bản
        const res = await authService.updateAccount(id, updateData);
        
        // 2. Nếu có role, cập nhật role riêng biệt
        if (updateData.role) {
            try {
                await authService.updateAccountRoles(id, updateData.role);
            } catch (roleError) {
                console.error("Lỗi cập nhật vai trò:", roleError);
                // Bạn có thể chọn throw lỗi này hoặc chỉ log tùy logic
            }
        }

        // 3. Refresh danh sách để đảm bảo dữ liệu mới nhất
        await fetchAccounts();
        return res.data;
    };

    const deleteAccount = async (id) => {
        await authService.deleteAccount(id);
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const updateAccountStatus = async (id) => {
        const target = accounts.find(a => a.id === id);
        if (!target) return;

        const newStatus = target.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
        
        try {
            const res = await authService.updateAccountStatus(id, newStatus);
            
            setAccounts(prev => prev.map(acc =>
                acc.id === id ? { ...acc, ...res.data } : acc
            ));

            await fetchAccounts();
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        accounts,
        loadUser,
        login,
        register,
        logout,
        fetchAccounts,
        updateAccount,
        deleteAccount,
        updateAccountStatus,
        resendOtp: authService.resendOtp,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
        checkEmail: authService.checkEmail,
        checkUsername: authService.checkUsername,
        identity: authService,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Chỉ render con khi đã kiểm tra xong token (loading = false).
               Nếu token còn hạn, user sẽ thấy trang Dashboard ngay thay vì thấy trang Login 0.5s.
            */}
            {!loading ? children : (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Đang xác thực phiên làm việc...</p>
                </div>
            )}
        </AuthContext.Provider>
    );
};