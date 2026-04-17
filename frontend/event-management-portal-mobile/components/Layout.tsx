import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
  headerProps?: any;
  showFooter?: boolean;
}

const Layout = ({ children, user, onLogin, onLogout, headerProps = {} }: LayoutProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header currentUser={user} onLogin={onLogin} onLogout={onLogout} {...headerProps} />
      
      <View style={styles.main}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  main: { flex: 1 }, // Để children chiếm toàn bộ không gian
});

export default Layout;
