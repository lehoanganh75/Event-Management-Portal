import React from "react";
import { Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const logo_iuh = require('../assets/images/logo_iuh.png');

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#1a3a6b]">
      <StatusBar style="light" />

      {/* 1. Phần Logo */}
      <View className="flex-[1.2] items-center justify-center px-10">
        <View className="bg-white/10 p-8 rounded-[40px] border border-white/10">
          <Image
            source={logo_iuh}
            style={{ width: width * 0.5, height: 100 }}
            contentFit="contain"
          />
        </View>
      </View>

      {/* 2. Phần nội dung chữ */}
      <View className="flex-1 px-8 items-center">
        <Text className="text-white text-3xl font-extrabold text-center leading-tight">
          Hệ thống Quản lý{"\n"}
          <Text className="text-blue-400 font-black">Sự kiện IUH</Text>
        </Text>
        
        <View className="h-1 w-12 bg-blue-400 my-5 rounded-full" />

        <Text className="text-blue-100/70 text-center text-sm leading-6 px-4">
          Nền tảng số hóa quy trình tổ chức sự kiện, tích lũy điểm rèn luyện dành cho sinh viên và giảng viên IUH.
        </Text>

        {/* 3. Nút bấm điều hướng */}
        <View className="w-full mt-auto mb-12 space-y-4">
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
            className="bg-white py-4 rounded-2xl items-center shadow-xl shadow-black/20"
          >
            <Text className="text-[#1a3a6b] font-bold text-lg">Đăng nhập ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/register')}
            activeOpacity={0.7}
            className="py-2 items-center"
          >
            <Text className="text-blue-200 text-sm font-medium">
              Chưa có tài khoản? <Text className="text-white font-bold underline">Đăng ký</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;