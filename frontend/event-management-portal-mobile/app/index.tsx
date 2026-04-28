import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const logo_iuh = require("../assets/images/logo_iuh.png");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Logo Section - Làm trọng tâm */}
      <View style={styles.logoSection}>
        <Image
          source={logo_iuh}
          style={styles.logo}
          contentFit="contain"
          transition={1000}
        />
      </View>

      {/* Nội dung chính */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>
          Hệ thống Quản lý{"\n"}
          <Text style={styles.titleHighlight}>Sự kiện IUH</Text>
        </Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Nền tảng số hóa quy trình tổ chức sự kiện và tích lũy điểm rèn luyện
          {"\n"}
          dành cho sinh viên & giảng viên Trường Đại học Công nghiệp TP.HCM
        </Text>

        {/* Buttons */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.82}
            style={styles.loginBtn}
          >
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.7}
            style={styles.registerBtn}
          >
            <Text style={styles.registerBtnText}>
              Chưa có tài khoản?{" "}
              <Text style={styles.registerLink}>Đăng ký</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  logoSection: {
    flex: 1.25,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  logo: {
    width: width * 0.72,
    height: 160,
  },

  contentSection: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 70,
  },

  title: {
    color: "#1a3a6b",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -0.5,
  },

  titleHighlight: {
    color: "#1a3a6b", // Màu xanh IUH chính
    fontWeight: "900",
  },

  divider: {
    height: 5,
    width: 60,
    backgroundColor: "#1a3a6b",
    marginVertical: 28,
    borderRadius: 9999,
  },

  description: {
    color: "#64748b",
    fontSize: 15.8,
    lineHeight: 26,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  buttonWrapper: {
    width: "100%",
    marginTop: 50,
    gap: 18,
  },

  loginBtn: {
    backgroundColor: "#1a3a6b",
    paddingVertical: 19,
    borderRadius: 22,
    alignItems: "center",
    shadowColor: "#1a3a6b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },

  loginBtnText: {
    color: "#ffffff",
    fontSize: 18.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  registerBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },

  registerBtnText: {
    color: "#64748b",
    fontSize: 15.5,
    fontWeight: "500",
  },

  registerLink: {
    color: "#1a3a6b",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
