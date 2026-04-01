import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from './Header'; 
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    user?: any;
    onLogin?: () => void;
    onLogout?: () => void;
    headerProps?: any;
    showFooter?: boolean; 
}

const Layout = ({ 
    children, 
    user, 
    onLogin, 
    onLogout, 
    headerProps = {}, 
    showFooter = true 
}: LayoutProps) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* 1. Header luôn cố định ở trên cùng */}
      <Header
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        {...headerProps}
      />

      {/* 2. Phần nội dung chính (Main) - không dùng ScrollView ở đây để tránh
          xung đột cuộn khi các screen con có ScrollView riêng */}
      <View className="flex-1 w-full">
        {children}
        {/* 3. Footer nằm cuối nội dung (nếu screen con cuộn, footer sẽ theo sau) */}
        {showFooter && <Footer />}
      </View>
    </SafeAreaView>
  );
};

export default Layout;