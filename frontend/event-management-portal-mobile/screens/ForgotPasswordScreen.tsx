import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const logo_iuh = require('../assets/images/logo_iuh.png');

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendRequest = async () => {
    if (!email.trim()) {
      setError('Email không được để trống');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Giả lập gọi API
      setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]" // Đổi sang màu nền nhạt hơn cho sang trọng
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="px-6" // Padding ngang cố định 24px
      >
        {/* Nút Quay lại - Tối ưu hitbox (vùng chạm) */}
        <View className="pt-12 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center w-32"
          >
            <View className="w-9 h-9 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
              <Ionicons name="chevron-back" size={20} color="#1e3a8a" />
            </View>
            <Text className="ml-3 text-slate-600 font-medium">Quay lại</Text>
          </TouchableOpacity>
        </View>

        {/* Header Branding - Tỉ lệ vàng cho Mobile */}
        <View className="items-center mt-4 mb-8">
          <Image
            source={logo_iuh}
            className="h-14 w-36 mb-5" // Thu nhỏ logo một chút để cân đối
            contentFit="contain"
          />
          <Text className="text-2xl font-extrabold text-[#1a3a6b] tracking-tight">
            Quên mật khẩu?
          </Text>
          <Text className="text-slate-400 text-center mt-2 px-6 leading-5 text-sm">
            Đừng lo, chúng tôi sẽ gửi hướng dẫn khôi phục đến email của bạn
          </Text>
        </View>

        {/* Card Form - Chiếm 90-95% chiều rộng */}
        <View className="bg-white rounded-[32px] shadow-sm border border-slate-50 overflow-hidden mb-6">
          <View className="h-1.5 bg-[#1a3a6b]" />

          <View className="p-7">
            {!isSuccess ? (
              <View>
                <Text className="text-[13px] font-bold text-slate-700 mb-2.5 ml-1">
                  ĐỊA CHỈ EMAIL ĐĂNG KÝ
                </Text>

                <View className={`flex-row items-center border-2 rounded-2xl px-4 py-3 bg-slate-50/50 ${error ? 'border-red-200' : 'border-slate-100'}`}>
                  <Ionicons name="mail" size={18} color={error ? "#f87171" : "#94a3b8"} />
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    placeholder="example@iuh.edu.vn"
                    placeholderTextColor="#cbd5e1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-3 text-base text-slate-800 font-medium"
                  />
                </View>

                {error ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-500 text-xs ml-1">{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handleSendRequest}
                  disabled={loading}
                  activeOpacity={0.8}
                  className={`mt-8 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-900/20 ${loading ? 'bg-slate-400' : 'bg-[#1a3a6b]'}`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
                      GỬI YÊU CẦU
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Success State - Căn chỉnh lại cho gọn */
              <View className="items-center py-2">
                <View className="w-16 h-16 bg-emerald-50 rounded-full items-center justify-center mb-5">
                  <Ionicons name="checkmark-circle" size={44} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-slate-800 text-center">
                  Đã gửi thành công!
                </Text>
                <Text className="text-slate-500 text-center mt-3 leading-5 text-sm">
                  Một liên kết khôi phục đã được gửi đến{"\n"}
                  <Text className="font-bold text-slate-700">{email}</Text>.{"\n"}
                  Vui lòng kiểm tra hộp thư của bạn.
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace('/login')}
                  className="mt-8 w-full py-4 bg-[#1a3a6b] rounded-2xl items-center"
                >
                  <Text className="text-white font-bold text-base">VỀ ĐĂNG NHẬP</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isSuccess && (
              <View className="flex-row justify-center mt-8">
                <Text className="text-slate-400 text-sm">Nhớ mật khẩu? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text className="text-[#1a3a6b] font-bold text-sm">Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer Support - Padding bottom để không bị dính đáy màn hình */}
        <View className="mt-auto pb-10 items-center">
          <Text className="text-[11px] text-slate-400">Gặp vấn đề khi khôi phục?</Text>
          <TouchableOpacity className="mt-1 px-4 py-2">
            <Text className="text-[#1a3a6b] text-xs font-bold decoration-underline">
              Liên hệ Bộ phận Hỗ trợ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;