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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const logo_iuh = require('../assets/images/logo_iuh.png');

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // Lấy token từ URL/Params

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password: string) => {
    const errs = [];
    if (!password.trim()) return ["Mật khẩu không được để trống"];
    if (password.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(password)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[a-z]/.test(password)) errs.push("Ít nhất 1 chữ thường");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errs.push("Ít nhất 1 ký tự đặc biệt");
    return errs;
  };

  const handleSubmit = async () => {
    const newErrs: any = {};
    const pwErrs = validatePassword(formData.newPassword);
    
    if (pwErrs.length > 0) newErrs.newPassword = pwErrs;
    if (formData.newPassword !== formData.confirmPassword) {
      newErrs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs);
      return;
    }

    setLoading(true);
    try {
      // Giả lập gọi API reset password
      setTimeout(() => {
        setLoading(false);
        setStatus({ type: "success", message: "Đặt lại mật khẩu thành công!" });
        setTimeout(() => router.replace('/login'), 2000);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", message: "Liên kết đã hết hạn hoặc không hợp lệ." });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Nút Quay lại */}
        <View className="pt-12 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center w-40">
            <View className="w-9 h-9 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
              <Ionicons name="chevron-back" size={20} color="#1e3a8a" />
            </View>
            <Text className="ml-3 text-slate-600 font-medium text-sm">Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View className="items-center mt-4 mb-8">
          <Image source={logo_iuh} className="h-14 w-36 mb-5" contentFit="contain" />
          <Text className="text-2xl font-extrabold text-[#1a3a6b] tracking-tight text-center">Đặt lại mật khẩu</Text>
          <Text className="text-slate-400 text-center mt-2 px-6 text-sm leading-5">Vui lòng nhập mật khẩu mới bảo mật hơn để bảo vệ tài khoản</Text>
        </View>

        {/* Card Form - 90% width */}
        <View className="bg-white rounded-[32px] shadow-sm border border-slate-50 overflow-hidden mb-6">
          <View className="h-1.5 bg-[#1a3a6b] w-full" />
          
          <View className="p-7">
            {status.message ? (
               <View className={`flex-row items-start p-4 rounded-2xl mb-6 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <Ionicons name={status.type === 'success' ? "checkmark-circle" : "alert-circle"} size={20} color={status.type === 'success' ? "#10b981" : "#ef4444"} />
                  <Text className={`ml-3 flex-1 text-xs font-medium ${status.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{status.message}</Text>
               </View>
            ) : null}

            {!token && !status.message && (
               <View className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex-row items-start">
                  <Ionicons name="warning" size={20} color="#f59e0b" />
                  <Text className="ml-3 flex-1 text-amber-800 text-xs font-medium">Thiếu mã xác thực. Vui lòng yêu cầu cấp lại mật khẩu từ ứng dụng.</Text>
               </View>
            )}

            <View className="space-y-5">
              {/* Mật khẩu mới */}
              <View>
                <Text className="text-[11px] font-bold text-slate-500 mb-2 ml-1 uppercase">Mật khẩu mới</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 py-3 bg-slate-50/50 ${errors.newPassword ? 'border-red-100' : 'border-slate-100'}`}>
                  <Ionicons name="lock-closed" size={18} color="#94a3b8" />
                  <TextInput
                    value={formData.newPassword}
                    onChangeText={(t) => {
                      setFormData(p => ({...p, newPassword: t}));
                      if(errors.newPassword) setErrors((p:any) => ({...p, newPassword: null}));
                    }}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry={!showNew}
                    className="flex-1 ml-3 text-base text-slate-800 font-medium"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                    <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {errors.newPassword?.map((e: string, i: number) => (
                  <Text key={i} className="text-red-500 text-[10px] mt-1 ml-1">• {e}</Text>
                ))}
              </View>

              {/* Xác nhận mật khẩu */}
              <View className="mt-4">
                <Text className="text-[11px] font-bold text-slate-500 mb-2 ml-1 uppercase">Xác nhận mật khẩu</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 py-3 bg-slate-50/50 ${errors.confirmPassword ? 'border-red-100' : 'border-slate-100'}`}>
                  <Ionicons name="shield-checkmark" size={18} color="#94a3b8" />
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(t) => {
                      setFormData(p => ({...p, confirmPassword: t}));
                      if(errors.confirmPassword) setErrors((p:any) => ({...p, confirmPassword: null}));
                    }}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry={!showConfirm}
                    className="flex-1 ml-3 text-base text-slate-800 font-medium"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                    <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || !token}
                activeOpacity={0.8}
                className={`mt-6 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-900/10 ${loading || !token ? 'bg-slate-300' : 'bg-[#1a3a6b]'}`}
              >
                {loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-base tracking-wide">XÁC NHẬN ĐẶT LẠI</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-auto pb-10 items-center">
          <Text className="text-[11px] text-slate-400">Gặp khó khăn?</Text>
          <TouchableOpacity className="mt-1 px-4 py-2">
            <Text className="text-[#1a3a6b] text-xs font-bold underline">Hỗ trợ kỹ thuật IUH</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;