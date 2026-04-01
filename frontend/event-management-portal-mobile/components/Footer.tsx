import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const logo_iuh = require('../assets/images/logo_iuh.png');

const Footer = () => {
  const router = useRouter();

  const openMap = (address: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${address}`;
    
    Linking.openURL(url);
  };

  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const BranchInfo = ({ title, address, phone }: { title: string, address: string, phone: string }) => (
    <View className="mb-6 border-l-2 border-[#ffcc00] pl-3">
      <Text className="text-[#ffcc00] font-bold uppercase text-xs mb-1">{title}</Text>
      <Text className="text-white text-[11px] leading-4 mb-2">{address} - ĐT: {phone}</Text>
      <TouchableOpacity 
        onPress={() => openMap(address)}
        className="bg-white/10 self-start px-3 py-1.5 rounded-full flex-row items-center"
      >
        <Ionicons name="map-outline" size={12} color="#ffcc00" />
        <Text className="text-white text-[10px] ml-1">Xem bản đồ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="w-full bg-[#245bb5] pt-8 pb-6 px-5">
      {/* Logo & Tên trường */}
      <View className="items-center mb-8">
        <Image
          source={logo_iuh} 
          className="h-12 w-40 mb-4 brightness-0 invert" 
          resizeMode="contain" 
        />
        <Text className="text-[#ffcc00] font-bold uppercase text-center text-sm">
          Đại học Công nghiệp TP. Hồ Chí Minh
        </Text>
      </View>

      {/* Thông tin liên hệ chính */}
      <View className="space-y-4 mb-8">
        <TouchableOpacity onPress={() => openMap("12 Nguyễn Văn Bảo, Gò Vấp, HCM")} className="flex-row items-start">
          <Ionicons name="location" size={18} color="#ffcc00" />
          <Text className="text-white text-xs ml-3 flex-1">
            Số 12 Nguyễn Văn Bảo, P.4, Q. Gò Vấp, TP. Hồ Chí Minh
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => callNumber("02838940390")} className="flex-row items-start">
          <Ionicons name="call" size={18} color="#ffcc00" />
          <Text className="text-white text-xs ml-3 flex-1">
            0283 8940 390 (Tuyển sinh: 028 3985 1932)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('mailto:dhcn@iuh.edu.vn')} className="flex-row items-start">
          <Ionicons name="mail" size={18} color="#ffcc00" />
          <Text className="text-white text-xs ml-3 flex-1">dhcn@iuh.edu.vn</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white font-bold italic text-base mb-4 border-b border-white/20 pb-2">
        Các cơ sở và phân hiệu
      </Text>

      {/* Danh sách các cơ sở */}
      <BranchInfo 
        title="Cơ sở Nguyễn Văn Dung"
        address="Số 10 Nguyễn Văn Dung, P.6, Gò Vấp, TP.HCM"
        phone="0283.8940 390"
      />
      <BranchInfo 
        title="Cơ sở Phạm Văn Chiêu"
        address="Số 20 Đường số 53, P.14, Gò Vấp, TP.HCM"
        phone="0283.8940 390"
      />
      <BranchInfo 
        title="Phân hiệu Quảng Ngãi"
        address="938 Quang Trung, P. Chánh Lộ, TP. Quảng Ngãi"
        phone="0255.625.0075"
      />
      <BranchInfo 
        title="Cơ sở Thanh Hóa"
        address="Xã Quảng Phú, TP. Thanh Hóa, Tỉnh Thanh Hóa"
        phone="0237.3675.092"
      />

      {/* Thống kê truy cập */}
      <View className="border-t border-white/10 pt-6 mt-4 flex-row justify-around">
        <View className="items-center">
          <Ionicons name="people" size={20} color="#ffcc00" />
          <Text className="text-white text-[10px] mt-1">Truy cập</Text>
          <Text className="text-white font-bold text-xs">288,704,603</Text>
        </View>
        <View className="items-center">
          <Ionicons name="radio-outline" size={20} color="#34d399" />
          <Text className="text-white text-[10px] mt-1">Online</Text>
          <Text className="text-white font-bold text-xs">218</Text>
        </View>
      </View>

      {/* Copyright */}
      <Text className="text-white/50 text-center text-[10px] mt-8">
        © 2026 Đại học Công nghiệp TP.HCM - IUH{"\n"}
        Event Management Portal Mobile
      </Text>
    </View>
  );
};

export default Footer;