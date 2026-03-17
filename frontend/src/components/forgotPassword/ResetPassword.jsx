import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return setStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp!' });
        }

        setLoading(true);
        try {
            await axios.post(`http://localhost:8081/api/auth/reset-password`, null, {
                params: {
                    token: token,
                    newPassword: formData.newPassword
                }
            });
            setStatus({ type: 'success', message: 'Thành công! Đang chuyển hướng...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Liên kết không hợp lệ.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            {/* max-w-md là kích thước chuẩn, gọn gàng nhất cho form reset */}
            <div className="max-w-md w-full">                
                <div className="flex justify-center mb-6">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    <div className="text-center mb-6"> 
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đặt lại mật khẩu</h2>
                        <p className="text-slate-500 mt-2 text-sm">Nhập mật khẩu mới để tiếp tục.</p>
                    </div>

                    {status.message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                            <span>{status.type === 'success' ? '✓' : '⚠'}</span>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4"> 
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                placeholder="Tối thiểu 8 ký tự"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all duration-200 text-sm placeholder:text-slate-300"
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Xác nhận lại</label>
                            <input
                                type="password"
                                required
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all duration-200 text-sm placeholder:text-slate-300"
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="group relative w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 overflow-hidden mt-2"
                        >
                            <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                                Xác nhận
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-50 pt-4">
                        <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1 group">
                            <span className="group-hover:-translate-x-1 transition-transform text-sm">←</span>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
                
                <p className="mt-6 text-center text-slate-400 text-[10px]">
                    &copy; 2026 Event Management System.
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;