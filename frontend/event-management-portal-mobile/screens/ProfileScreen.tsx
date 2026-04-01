import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Layout from '@/components/Layout';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();

  // Giả lập dữ liệu user (Sau này lấy từ Global State/Context)
  const user = {
    fullName: "Nguyễn Hoàng Anh",
    studentId: "20012345",
    email: "anh.nh@iuh.edu.vn",
    department: "Khoa Công nghệ Thông tin",
    avatar: null,
    eventsAttended: 12,
    points: 85,
    rank: "Năng nổ"
  };

  const StatItem = ({ label, value, icon, color }: any) => (
    <View className="flex-1 items-center p-4 bg-white rounded-3xl border border-slate-50 shadow-sm mx-1">
      <View className={`w-10 h-10 ${color} rounded-full items-center justify-center mb-2`}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text className="text-lg font-black text-slate-800">{value}</Text>
      <Text className="text-[10px] text-slate-400 uppercase font-bold text-center">{label}</Text>
    </View>
  );

  const MenuLink = ({ title, icon, subtitle, onPress, color = "text-slate-700" }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center p-4 mb-3 bg-slate-50/50 rounded-3xl border border-slate-100"
    >
      <View className="w-11 h-11 bg-white rounded-2xl items-center justify-center shadow-sm">
        <Ionicons name={icon} size={22} color="#1a479a" />
      </View>
      <View className="ml-4 flex-1">
        <Text className={`font-bold text-sm ${color}`}>{title}</Text>
        {subtitle && <Text className="text-[10px] text-slate-400">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <Layout>
      <StatusBar style="light" />
      <ScrollView 
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* --- Header Blue Background --- */}
        <View className="bg-[#1a479a] pt-12 pb-24 px-6 rounded-b-[50px] items-center">
          <Text className="text-white font-bold text-lg mb-6">Trang cá nhân</Text>
          
          {/* Avatar & Basic Info */}
          <View className="relative">
            <View className="w-28 h-28 bg-white p-1 rounded-full shadow-2xl">
              <View className="w-full h-full bg-slate-200 rounded-full items-center justify-center overflow-hidden">
                <Image 
                  source={{ uri: user.avatar || 'https://ui-avatars.com/api/?name=User&background=random' }} 
                  className="w-full h-full"
                />
              </View>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#ffcc00] w-9 h-9 rounded-full items-center justify-center border-4 border-[#1a479a]">
              <Ionicons name="camera" size={16} color="#1a479a" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-2xl font-black mt-4">{user.fullName}</Text>
          <Text className="text-blue-200 text-sm font-medium">{user.studentId} • {user.department}</Text>
        </View>

        {/* --- Stats Card (Floating) --- */}
        <View className="px-6 -mt-14 flex-row justify-between">
          <StatItem label="Sự kiện" value={user.eventsAttended} icon="calendar" color="bg-blue-500" />
          <StatItem label="Điểm RL" value={user.points} icon="star" color="bg-orange-400" />
          <StatItem label="Hạng" value={user.rank} icon="trophy" color="bg-emerald-500" />
        </View>

        {/* --- Main Content --- */}
        <View className="mt-8 px-6">
          
          {/* My QR Section */}
          <View className="bg-blue-50 p-5 rounded-[35px] flex-row items-center border border-blue-100 mb-8">
            <View className="bg-white p-3 rounded-2xl shadow-sm">
              <Ionicons name="qr-code" size={40} color="#1a479a" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[#1a479a] font-black text-base uppercase">Mã số sinh viên</Text>
              <Text className="text-slate-500 text-xs">Dùng để quét điểm danh nhanh</Text>
            </View>
            <TouchableOpacity className="bg-[#1a479a] px-4 py-2 rounded-xl">
              <Text className="text-white font-bold text-xs">Hiện mã</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Groups */}
          <View>
            <Text className="text-slate-400 text-[11px] font-black uppercase tracking-widest ml-1 mb-4">Cài đặt tài khoản</Text>
            <MenuLink 
              title="Thông tin chi tiết" 
              icon="person-outline" 
              subtitle="Cập nhật email, số điện thoại, khoa..."
            />
            <MenuLink 
              title="Lịch sử tham gia" 
              icon="time-outline" 
              subtitle="Xem lại các sự kiện đã check-in"
            />
            <MenuLink 
              title="Chứng nhận & Kết quả" 
              icon="ribbon-outline" 
              subtitle="Tải về file minh chứng điểm rèn luyện"
            />
          </View>

          <View className="mt-6">
            <Text className="text-slate-400 text-[11px] font-black uppercase tracking-widest ml-1 mb-4">Hệ thống</Text>
            <MenuLink 
              title="Cài đặt thông báo" 
              icon="notifications-outline" 
            />
            <MenuLink 
              title="Trung tâm hỗ trợ" 
              icon="help-buoy-outline" 
            />
            <MenuLink 
              title="Đăng xuất" 
              icon="log-out-outline" 
              color="text-rose-500"
              onPress={() => {/* Xử lý logout */}}
            />
          </View>

        </View>

        {/* Footer info */}
        <View className="mt-10 items-center">
          <Image 
            source={require('../assets/images/logo_iuh.png')} 
            style={{ width: 100, height: 40, opacity: 0.3 }}
            resizeMode="contain"
          />
          <Text className="text-slate-300 text-[10px] mt-2 font-medium">Phiên bản ứng dụng 1.0.0 (BETA)</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default ProfileScreen;