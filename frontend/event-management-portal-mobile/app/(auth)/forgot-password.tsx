import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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
const logo_iuh = require("../../assets/images/logo_iuh.png");

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Logic Steps: 1 (Email), 2 (OTP), 3 (New Password)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  // Xử lý OTP ô vuông
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Các hàm xử lý chuyển bước
  const handleSendEmail = () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setResendCountdown(60);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.join("").length < 6) return;
    setStep(3);
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/login");
    }, 2000);
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#1a3a6b" />
          </TouchableOpacity>

          <View style={styles.branding}>
            <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
            <Text style={styles.title}>
              {step === 1
                ? "Quên mật khẩu?"
                : step === 2
                  ? "Xác thực mã OTP"
                  : "Mật khẩu mới"}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIndicator} />

            {/* Bước 1: Nhập Email */}
            {step === 1 && (
              <View style={styles.formSection}>
                <Text style={styles.instruction}>
                  Nhập email sinh viên để nhận mã khôi phục
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#1a3a6b" />
                  <TextInput
                    placeholder="example@student.iuh.edu.vn"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSendEmail}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>GỬI MÃ XÁC THỰC</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Bước 2: Nhập OTP */}
            {step === 2 && (
              <View style={styles.formSection}>
                <Text style={styles.instruction}>
                  Mã xác thực đã được gửi tới {email}
                </Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      style={styles.otpBox}
                      maxLength={1}
                      keyboardType="number-pad"
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  disabled={resendCountdown > 0}
                  style={styles.resendBtn}
                >
                  <Text
                    style={[
                      styles.resendText,
                      resendCountdown > 0 && { color: "#94a3b8" },
                    ]}
                  >
                    {resendCountdown > 0
                      ? `Gửi lại sau ${resendCountdown}s`
                      : "Gửi lại mã OTP"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleVerifyOtp}
                >
                  <Text style={styles.btnText}>TIẾP TỤC</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bước 3: Đặt lại mật khẩu */}
            {step === 3 && (
              <View style={styles.formSection}>
                <Text style={styles.instruction}>
                  Tạo mật khẩu mới cho tài khoản của bạn
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#1a3a6b"
                  />
                  <TextInput
                    placeholder="Mật khẩu mới"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
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

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#1a3a6b"
                  />
                  <TextInput
                    placeholder="Xác nhận mật khẩu"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleResetPassword}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>CẬP NHẬT MẬT KHẨU</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã nhớ mật khẩu? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
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
  instruction: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginBottom: 25,
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
  formSection: { padding: 24 },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  otpBox: {
    width: (width - 110) / 6,
    height: 55,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a3a6b",
  },
  resendBtn: { alignSelf: "center", marginVertical: 15 },
  resendText: { color: "#1a3a6b", fontWeight: "700", fontSize: 14 },

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

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: "#64748b", fontSize: 14 },
  linkText: {
    color: "#1a3a6b",
    fontWeight: "800",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
