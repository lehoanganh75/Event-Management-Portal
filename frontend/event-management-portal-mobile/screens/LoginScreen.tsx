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
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const logo_iuh = require('../assets/images/logo_iuh.png');

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = Dimensions.get('window');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: 'username' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Giả lập gọi API
      setTimeout(() => {
        setIsLoading(false);
        setMessage('Đăng nhập thành công!');
        setToastVisible(true);

        setTimeout(() => {
          navigation.replace('(tabs)/home');
        }, 1500);
      }, 1200);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      setErrorToastVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#eef2f7]"
    >
      <StatusBar style="light" />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center">
          
          {/* Toast Thành công */}
          {toastVisible && (
            <View className="absolute top-12 left-5 right-5 z-50">
              <View className="bg-emerald-600 rounded-2xl p-5 flex-row items-start shadow-2xl">
                <View className="w-11 h-11 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Ionicons name="checkmark-circle" size={28} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">Thành công</Text>
                  <Text className="text-white/90 mt-1">{message}</Text>
                </View>
                <TouchableOpacity onPress={() => setToastVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Toast Lỗi */}
          {errorToastVisible && (
            <View className="absolute top-12 left-5 right-5 z-50">
              <View className="bg-red-600 rounded-2xl p-5 flex-row items-start shadow-xl">
                <Ionicons name="alert-circle" size={28} color="white" style={{ marginRight: 16, marginTop: 4 }} />
                <View className="flex-1">
                  <Text className="text-white font-semibold">Đăng nhập thất bại</Text>
                  <Text className="text-white/90 mt-1 text-sm">{errorMessage}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorToastVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Card chính - Đồng bộ 90% chiều rộng */}
          <View style={{ width: width * 0.9 }} className="bg-white rounded-3xl overflow-hidden shadow-xl">
           {/* Header Branding */}
            <View className="bg-[#1a3a6b] px-6 py-8 items-center rounded-t-3xl">
              <View className="items-center">
                <Image
                  source={logo_iuh}
                  className="h-14 w-40 mb-4"
                  contentFit="contain"
                />
                <Text className="text-white text-3xl font-extrabold leading-tight text-center">
                  Hệ thống Quản lý{'\n'}
                  <Text className="text-blue-400">Sự kiện IUH</Text>
                </Text>
                <View className="mt-2 items-center">
                  <Text className="text-white font-bold text-[10px] tracking-widest">IUH</Text>
                  <Text className="text-blue-200 text-[8px]">ĐH CÔNG NGHIỆP TP.HCM</Text>
                </View>
              </View>

              <Text className="text-blue-100/70 mt-4 text-sm leading-6 text-center max-w-lg">
                Nền tảng số hóa toàn bộ quy trình tổ chức sự kiện từ đăng ký, check-in đến báo cáo realtime.
              </Text>

              <View className="flex-row items-center mt-8">
                <View className="flex-row mr-4">
                  {['SV', 'GV', 'BT'].map((tag, i) => (
                    <View
                      key={tag}
                      className={`w-8 h-8 rounded-full border-2 border-[#1a3a6b] items-center justify-center -ml-2.5 shadow-sm
                        ${i === 0 ? 'bg-blue-500 z-30 ml-0' : i === 1 ? 'bg-emerald-500 z-20' : 'bg-orange-500 z-10'}`}
                      >
                      <Text className="text-[9px] text-white font-black">{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text className="text-blue-300/80 text-[11px] font-medium italic">
                  Hàng nghìn người dùng tin tưởng
                </Text>
              </View>
            </View>

            {/* Form Đăng nhập */}
            <View className="p-8">
              <Text className="text-2xl font-bold text-[#1a3a6b] mb-1">Đăng nhập</Text>
              <Text className="text-gray-500 mb-6">Chào mừng bạn quay trở lại!</Text>

              <View className="space-y-4">
                {/* Username */}
                <View>
                  <TextInput
                    value={formData.username}
                    onChangeText={(text) => handleChange('username', text)}
                    placeholder="Tên đăng nhập"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    className={`bg-gray-100 px-4 py-3 rounded-full text-base ${errors.username ? 'border border-red-400' : ''}`}
                  />
                  {errors.username && <Text className="text-red-500 text-[10px] mt-1 ml-4">{errors.username}</Text>}
                </View>

                {/* Password */}
                <View>
                  <View className={`bg-gray-100 rounded-full flex-row items-center px-4 py-3 ${errors.password ? 'border border-red-400' : ''}`}>    
                    <TextInput
                      value={formData.password}
                      onChangeText={(text) => handleChange('password', text)}
                      placeholder="Mật khẩu"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      className="flex-1 text-base"
                    />
                    
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text className="text-red-500 text-[10px] mt-1 ml-4">{errors.password}</Text>}
                </View>

                {/* Remember & Forgot */}
                <View className="flex-row justify-between items-center px-2">
                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View className={`w-4 h-4 rounded border items-center justify-center ${rememberMe ? 'bg-[#1a3a6b] border-[#1a3a6b]' : 'border-gray-300'}`}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                    <Text className="text-gray-500 text-xs">Ghi nhớ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text className="text-[#1a3a6b] text-xs font-bold">Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View className={`py-3 rounded-full items-center shadow-md ${isLoading ? 'bg-[#15306b]' : 'bg-[#1a3a6b]'}`}>
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-base">ĐĂNG NHẬP</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Register Link */}
                <View className="flex-row justify-center mt-2">
                  <Text className="text-gray-500 text-sm">Chưa có tài khoản? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text className="text-[#1a3a6b] font-bold text-sm">Đăng ký ngay</Text>
                  </TouchableOpacity>
                </View>

                {/* Support */}
                <View className="mt-4 items-center">
                  <TouchableOpacity>
                    <Text className="text-[#1a3a6b] text-xs font-medium">Liên hệ hỗ trợ kỹ thuật</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;