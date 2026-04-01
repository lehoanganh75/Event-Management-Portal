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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const logo_iuh = require('../assets/images/logo_iuh.png');

const features = [
  { icon: 'calendar-outline', title: 'Quản lý sự kiện', desc: 'Tạo & theo dõi dễ dàng' },
  { icon: 'qr-code-outline', title: 'Điểm danh QR', desc: 'Nhanh chóng & chính xác' },
  { icon: 'gift-outline', title: 'Vòng quay may mắn', desc: 'Tăng tương tác' },
];

const RegisterScreen = () => {
  const navigation = useNavigation<any>();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toastVisible, setToastVisible] = useState(false);
  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { width } = Dimensions.get('window');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async () => {
    // Validation cơ bản
    const newErrors: any = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Gọi API đăng ký thực tế
      // await authApi.register(formData);

      setTimeout(() => {
        setIsLoading(false);
        setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
        setToastVisible(true);

        setTimeout(() => {
          navigation.navigate('Login');
        }, 2200);
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
      setErrorToastVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#eef2f7]"
    >
      <StatusBar style="dark" />

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
                  <Ionicons name="mail-outline" size={28} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">Vui lòng xác nhận email!</Text>
                  <Text className="text-white/90 mt-1 text-sm">{message}</Text>
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
              <View className="bg-red-600 rounded-2xl p-5 flex-row items-start shadow-2xl">
                <Ionicons name="alert-circle" size={28} color="white" style={{ marginRight: 16, marginTop: 4 }} />
                <View className="flex-1">
                  <Text className="text-white font-semibold">Đăng ký thất bại</Text>
                  <Text className="text-white/90 mt-1">{errorMessage}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorToastVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ width: width * 0.9 }} className="rounded-3xl overflow-hidden shadow-lg">
            <View className="bg-[#1a3a6b] px-6 py-8 items-center rounded-t-3xl">
              <Image source={logo_iuh} style={{ width: 100, height: 100 }} className="mb-3" contentFit="contain" />
              <Text className="text-white text-xl font-bold text-center">Tham gia cùng cộng đồng IUH</Text>
              <Text className="text-blue-200 text-center mt-2 text-sm">Đăng ký để tham gia sự kiện, tích lũy điểm rèn luyện và kết nối cộng đồng sinh viên.</Text>
            </View>

            <View className="bg-white p-6">
              <Text className="text-2xl font-bold text-[#1a3a6b] mb-2">Tạo tài khoản</Text>
              <Text className="text-gray-500 mb-4">Điền thông tin để bắt đầu trải nghiệm</Text>

              <View className="space-y-3">
                <TextInput value={formData.fullName} onChangeText={(t) => handleChange('fullName', t)} placeholder="Họ và tên" placeholderTextColor="#9ca3af" className="bg-gray-100 px-4 py-3 rounded-full" />
                <TextInput value={formData.email} onChangeText={(t) => handleChange('email', t)} placeholder="Email" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" className="bg-gray-100 px-4 py-3 rounded-full" />
                <TextInput value={formData.username} onChangeText={(t) => handleChange('username', t)} placeholder="Tên đăng nhập" placeholderTextColor="#9ca3af" autoCapitalize="none" className="bg-gray-100 px-4 py-3 rounded-full" />

                <View>
                  <TextInput value={formData.password} onChangeText={(t) => handleChange('password', t)} placeholder="Mật khẩu" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} className="bg-gray-100 px-4 py-3 rounded-full" />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: 12 }}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View>
                  <TextInput value={formData.confirmPassword} onChangeText={(t) => handleChange('confirmPassword', t)} placeholder="Xác nhận mật khẩu" placeholderTextColor="#9ca3af" secureTextEntry={!showConfirmPassword} className="bg-gray-100 px-4 py-3 rounded-full" />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 14, top: 12 }}>
                    <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <TextInput value={formData.dateOfBirth} onChangeText={(t) => handleChange('dateOfBirth', t)} placeholder="Ngày sinh" placeholderTextColor="#9ca3af" className="bg-gray-100 px-4 py-3 rounded-full" />

                <View className="flex-row items-center justify-start space-x-4">
                  {[{v:'MALE', l:'Nam'}, {v:'FEMALE', l:'Nữ'}, {v:'OTHER', l:'Khác'}].map(({v,l}) => (
                    <TouchableOpacity key={v} onPress={() => setFormData(prev => ({...prev, gender: v as any}))} className="flex-row items-center">
                      <View className={`w-4 h-4 rounded-full border-2 items-center justify-center mr-2 ${formData.gender === v ? 'border-[#1a3a6b]' : 'border-gray-300'}`}>
                        {formData.gender === v && <View className="w-2 h-2 bg-[#1a3a6b] rounded-full" />}
                      </View>
                      <Text className="text-sm text-gray-700">{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                  <View className="bg-[#1a3a6b] py-3 rounded-full items-center">
                    {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Đăng ký ngay</Text>}
                  </View>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-2">
                  <Text className="text-gray-500">Đã có tài khoản? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-[#1a3a6b] font-semibold">Đăng nhập ngay</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-6 items-center">
                <Text className="text-xs text-gray-400">Gặp vấn đề khi đăng ký?</Text>
                <TouchableOpacity className="mt-1">
                  <Text className="text-[#1a3a6b] text-sm font-medium">Liên hệ hỗ trợ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;