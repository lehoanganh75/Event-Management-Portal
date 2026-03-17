import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', content: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const response = await axios.post(`http://localhost:8081/api/auth/forgot-password?email=${email}`);
            
            setMessage({
                type: 'success',
                content: 'Một liên kết khôi phục đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-key text-blue-600 text-2xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Quên mật khẩu?</h2>
                    <p className="text-gray-600 mt-2">Đừng lo, chúng tôi sẽ gửi hướng dẫn khôi phục cho bạn.</p>
                </div>

                {/* Thông báo lỗi hoặc thành công */}
                {message.content && (
                    <div className={`mb-6 p-4 rounded-md text-sm ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.content}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Địa chỉ Email đăng ký
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="example@iuh.edu.vn"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Đang gửi...
                            </span>
                        ) : 'Gửi yêu cầu khôi phục'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Quay lại đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;