import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
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
const logo_iuh = require("@/assets/images/logo_iuh.png");

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Logic kiểm tra độ mạnh mật khẩu
  const validatePassword = (password: string) => {
    const errs = [];
    if (!password.trim()) return ["Mật khẩu không được để trống"];
    if (password.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(password)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[!@#$%^&*]/.test(password)) errs.push("Ít nhất 1 ký tự đặc biệt");
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
      // Giả lập API đặt lại mật khẩu
      setTimeout(() => {
        setLoading(false);
        setStatus({ type: "success", message: "Đặt lại mật khẩu thành công!" });
        setTimeout(() => router.replace("/login"), 2000);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setStatus({
        type: "error",
        message: "Liên kết đã hết hạn hoặc không hợp lệ.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nút quay lại */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#1a3a6b" />
          </TouchableOpacity>

          {/* Logo & Tiêu đề */}
          <View style={styles.branding}>
            <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mật khẩu mới bảo mật hơn để bảo vệ tài khoản của bạn
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.cardIndicator} />
            <View style={styles.cardContent}>
              {/* Thông báo Success/Error */}
              {status.message ? (
                <View
                  style={[
                    styles.alert,
                    status.type === "success"
                      ? styles.alertSuccess
                      : styles.alertError,
                  ]}
                >
                  <Ionicons
                    name={
                      status.type === "success"
                        ? "checkmark-circle"
                        : "alert-circle"
                    }
                    size={20}
                    color={status.type === "success" ? "#10b981" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.alertText,
                      {
                        color:
                          status.type === "success" ? "#065f46" : "#991b1b",
                      },
                    ]}
                  >
                    {status.message}
                  </Text>
                </View>
              ) : null}

              {/* Cảnh báo thiếu Token */}
              {!token && !status.message && (
                <View style={styles.alertWarning}>
                  <Ionicons name="warning" size={20} color="#f59e0b" />
                  <Text style={styles.warningText}>
                    Mã xác thực không hợp lệ. Vui lòng kiểm tra lại liên kết từ
                    Email.
                  </Text>
                </View>
              )}

              {/* Input Mật khẩu mới */}
              <View
                style={[
                  styles.inputSection,
                  { opacity: !token || status.type === "success" ? 0.5 : 1 },
                ]}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MẬT KHẨU MỚI</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.newPassword && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#1a3a6b"
                    />
                    <TextInput
                      value={formData.newPassword}
                      editable={!!token && status.type !== "success"}
                      placeholder="Nhập mật khẩu mới"
                      secureTextEntry={!showNew}
                      style={styles.textInput}
                      onChangeText={(t) =>
                        setFormData((p) => ({ ...p, newPassword: t }))
                      }
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                      <Ionicons
                        name={showNew ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.newPassword?.map((e: string, i: number) => (
                    <Text key={i} style={styles.errorText}>
                      • {e}
                    </Text>
                  ))}
                </View>

                {/* Input Xác nhận mật khẩu */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#1a3a6b"
                    />
                    <TextInput
                      value={formData.confirmPassword}
                      editable={!!token && status.type !== "success"}
                      placeholder="Nhập lại mật khẩu"
                      secureTextEntry={!showConfirm}
                      style={styles.textInput}
                      onChangeText={(t) =>
                        setFormData((p) => ({ ...p, confirmPassword: t }))
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* Nút xác nhận */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading || !token || status.type === "success"}
                  style={[
                    styles.btnPrimary,
                    (loading || !token || status.type === "success") && {
                      backgroundColor: "#cbd5e1",
                    },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>XÁC NHẬN ĐẶT LẠI</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerInfo}>Gặp khó khăn?</Text>
            <TouchableOpacity>
              <Text style={styles.supportLink}>Hỗ trợ kỹ thuật IUH</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  branding: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  logo: { height: 80, width: width * 0.6, marginBottom: 15 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1a3a6b",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardIndicator: { height: 6, backgroundColor: "#1a3a6b" },
  cardContent: { padding: 24 },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputSection: { gap: 20 },
  inputGroup: { gap: 4 },
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
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  inputError: { borderColor: "#fecaca" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4, marginLeft: 6 },

  btnPrimary: {
    backgroundColor: "#1a3a6b",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
    shadowColor: "#1a3a6b",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  alert: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  alertSuccess: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  alertError: { backgroundColor: "#fef2f2", borderColor: "#fee2e2" },
  alertWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    borderWidth: 1,
  },
  alertText: { marginLeft: 12, flex: 1, fontSize: 13, fontWeight: "600" },
  warningText: {
    marginLeft: 12,
    flex: 1,
    color: "#92400e",
    fontSize: 13,
    fontWeight: "600",
  },

  footer: { marginTop: 30, alignItems: "center" },
  footerInfo: { fontSize: 13, color: "#94a3b8" },
  supportLink: {
    color: "#1a3a6b",
    fontWeight: "bold",
    fontSize: 13,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});
