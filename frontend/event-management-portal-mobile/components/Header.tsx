import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

const roleMap: any = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  ORGANIZER: "Ban Tổ Chức",
  MEMBER: "Thành Viên",
  EVENT_PARTICIPANT: "Người Tham Gia",
  GUEST: "Khách",
};

interface HeaderProps {
  currentUser?: any;
  unreadCount?: number;
  onLogout?: () => void;
  onNavigate?: (screen: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount = 0,
  onLogout,
  onNavigate,
}) => {
  const navigation = useNavigation<any>();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutToastVisible, setLogoutToastVisible] = useState(false);

  const logo_iuh = require('../assets/images/logo_iuh.png');

  const getPrimaryRole = () => {
    const role = currentUser?.roles?.[0];
    return roleMap[role] || "Thành viên";
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false);
    setLogoutToastVisible(true);

    setTimeout(() => {
      setLogoutToastVisible(false);
      if (onLogout) onLogout();
      else navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 1500);
  };

  return (
    <>
      {/* 1. Top Mini Bar (Thông tin hệ thống) */}
      <View className="bg-[#1a479a] pt-12 pb-2 px-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
            <Text className="text-white text-[10px] font-medium opacity-90">
              Hệ thống Quản lý Sự kiện IUH
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center mr-4">
              <Ionicons name="help-circle-outline" size={14} color="#fff" />
              <Text className="text-white text-[9px] ml-1">Hỗ trợ</Text>
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Ionicons name="globe-outline" size={14} color="#fff" />
              <Text className="text-white text-[9px] ml-1">VN</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Main Header Bar (Logo & User) */}
      <View className="bg-white border-b border-slate-100 px-4 py-2.5 flex-row items-center justify-between shadow-sm">
        
        {/* Logo Area - Đã fix kích thước không bị tràn */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          activeOpacity={0.7}
          className="flex-1 justify-center"
        >
          <Image
            source={logo_iuh}
            className="h-10 w-32" // Kích thước chuẩn cho mobile
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Right Side Controls */}
        <View className="flex-row items-center">
          {currentUser && (
            <TouchableOpacity
              onPress={() => {/* Mở thông báo */}}
              className="p-2 mr-1"
            >
              <View className="relative">
                <Ionicons name="notifications-outline" size={22} color="#334155" />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border border-white">
                    <Text className="text-white text-[8px] font-bold">
                      {unreadCount > 99 ? '99' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* User Profile / Login Button */}
          {currentUser ? (
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              className="flex-row items-center bg-slate-50 py-1 pl-1 pr-2 rounded-full border border-slate-100"
            >
              <View className="relative">
                {currentUser.avatarUrl ? (
                  <Image
                    source={{ uri: currentUser.avatarUrl }}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <View className="w-8 h-8 bg-[#1a479a] rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-xs">
                      {currentUser.username?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </View>
              <Ionicons name="chevron-down" size={14} color="#64748b" className="ml-1" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-[#1a479a] px-4 py-2 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-bold text-xs uppercase">Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. User Menu Bottom Sheet (Modal) */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-[32px] overflow-hidden pb-8 shadow-2xl">
            <View className="w-12 h-1 bg-slate-200 self-center mt-3 rounded-full" />
            
            {/* User Profile Summary */}
            <View className="p-6 flex-row items-center border-b border-slate-50">
              <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100">
                <Text className="text-[#1a479a] text-2xl font-black">
                   {currentUser?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="ml-4">
                <Text className="font-bold text-lg text-slate-800">{currentUser?.fullName || currentUser?.username}</Text>
                <View className="flex-row items-center mt-0.5">
                  <MaterialCommunityIcons name="shield-check" size={14} color="#1a479a" />
                  <Text className="text-blue-700 text-xs font-semibold ml-1">{getPrimaryRole()}</Text>
                </View>
              </View>
            </View>

            {/* Navigation Options */}
            <View className="px-4 mt-2">
              <TouchableOpacity 
                onPress={() => { setIsMenuOpen(false); navigation.navigate('UserProfile'); }}
                className="flex-row items-center p-4 rounded-2xl active:bg-slate-50"
              >
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <Text className="text-slate-700 font-semibold ml-4">Thông tin cá nhân</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setIsMenuOpen(false); navigation.navigate('MyEvents'); }}
                className="flex-row items-center p-4 rounded-2xl active:bg-slate-50"
              >
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text className="text-slate-700 font-semibold ml-4">Sự kiện đã tham gia</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setIsMenuOpen(false); setIsLogoutModalOpen(true); }}
                className="flex-row items-center p-4 rounded-2xl active:bg-rose-50 mt-2"
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="text-rose-500 font-bold ml-4">Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 4. Logout Confirmation Modal */}
      <Modal visible={isLogoutModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white w-full rounded-[30px] p-8 items-center shadow-2xl">
            <View className="w-16 h-16 bg-rose-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
            </View>
            <Text className="text-lg font-bold text-slate-800">Xác nhận đăng xuất?</Text>
            <Text className="text-slate-500 text-center mt-2 mb-8">
              Bạn có chắc chắn muốn thoát khỏi hệ thống IUH Event không?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setIsLogoutModalOpen(false)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
              >
                <Text className="text-slate-600 font-bold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleLogout}
                className="flex-1 bg-rose-500 py-4 rounded-2xl items-center shadow-sm shadow-rose-300"
              >
                <Text className="text-white font-bold">Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Success Toast */}
      {logoutToastVisible && (
        <View className="absolute top-14 left-4 right-4 z-[9999]">
          <View className="bg-emerald-600 rounded-2xl p-4 flex-row items-center shadow-lg">
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-3 flex-1">Đăng xuất thành công!</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default Header;