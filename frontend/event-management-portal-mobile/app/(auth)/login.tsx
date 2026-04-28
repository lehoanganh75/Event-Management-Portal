import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const logo_iuh = require("assets/images/logo_iuh.png");

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    msg: string;
  }>({
    visible: false,
    type: "success",
    msg: "",
  });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ visible: true, type, msg });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2500);
  };

  const handleChange = (field: "username" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleLogin = async () => {
    const newErrors: any = {};
    if (!formData.username.trim())
      newErrors.username = "Vui lòng nhập MSSV/Tên đăng nhập";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });
      setIsLoading(false);
      showToast("Đăng nhập thành công!", "success");
      setTimeout(() => router.replace("/(tabs)/home"), 1000);
    } catch (error: any) {
      setIsLoading(false);
      const serverMsg =
        error?.response?.data?.message || error?.message || "Lỗi kết nối!";
      showToast(serverMsg, "error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Toast Notification */}
      {toast.visible && (
        <View style={styles.toastWrapper}>
          <View
            style={[
              styles.toast,
              toast.type === "success"
                ? styles.toastSuccess
                : styles.toastError,
            ]}
          >
            <Ionicons
              name={
                toast.type === "success" ? "checkmark-circle" : "alert-circle"
              }
              size={20}
              color="white"
            />
            <Text style={styles.toastText}>{toast.msg}</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.brandTitle}>Đăng nhập</Text>
            <Text style={styles.brandSub}>
              Chào mừng bạn quay trở lại với hệ thống Sự kiện IUH
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.username && styles.inputError,
                ]}
              >
                <Ionicons name="person-outline" size={20} color="#1a3a6b" />
                <TextInput
                  value={formData.username}
                  onChangeText={(t) => handleChange("username", t)}
                  placeholder="Mã số sinh viên..."
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#1a3a6b"
                />
                <TextInput
                  value={formData.password}
                  onChangeText={(t) => handleChange("password", t)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text style={styles.mutedText}>Ghi nhớ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                <Text style={styles.linkText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, isLoading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.mutedText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.linkTextBold}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  // Toast
  toastWrapper: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    elevation: 5,
  },
  toastSuccess: { backgroundColor: "#10b981" },
  toastError: { backgroundColor: "#ef4444" },
  toastText: { color: "white", marginLeft: 8, fontWeight: "600", fontSize: 13 },

  // Logo
  logoSection: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  logo: { height: 120, width: width * 0.7 },

  // Brand Header
  brandTitle: {
    color: "#1a3a6b",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "left",
  },
  brandSub: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 20,
  },

  // Form
  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fff1f2" },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#1a3a6b", borderColor: "#1a3a6b" },

  mutedText: { color: "#64748b", fontSize: 14, fontWeight: "500" },
  linkText: { color: "#1a3a6b", fontSize: 14, fontWeight: "700" },
  linkTextBold: {
    color: "#1a3a6b",
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  btnPrimary: {
    backgroundColor: "#1a3a6b",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#1a3a6b",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
});

export default LoginScreen;
