import { register, verifyOtp } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
const logo_iuh = require("assets/images/logo_iuh.png");

export default function RegisterScreen() {
  const router = useRouter();

  // Logic Steps: 1 (Personal), 2 (Account), 3 (OTP)
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: new Date(),
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState({
    visible: false,
    type: "success" as "success" | "error",
    msg: "",
  });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ visible: true, type, msg });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p: any) => ({ ...p, [field]: undefined }));
  };

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  // Xử lý nhập OTP từng ô
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo
    if (value !== "" && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Nhấn Backspace để quay lại ô trước
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const goToStep2 = () => {
    const err: any = {};
    if (!formData.fullName.trim()) err.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) err.email = "Vui lòng nhập email";
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    const err: any = {};
    if (!formData.username.trim()) err.username = "Nhập mã sinh viên";
    if (formData.password.length < 6) err.password = "Tối thiểu 6 ký tự";
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Mật khẩu không khớp";

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0],
      };
      await register(payload);
      showToast("Đã gửi mã OTP", "success");
      setStep(3);
      setResendCountdown(60);
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Lỗi đăng ký", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      showToast("Vui lòng nhập đủ 6 số", "error");
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtp(formData.username, otpString);
      showToast("Thành công!", "success");
      setTimeout(() => router.replace("/login"), 1500);
    } catch (error: any) {
      showToast("OTP không đúng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
          <View style={styles.logoSection}>
            <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>
              {step === 1
                ? "Thông tin cá nhân"
                : step === 2
                  ? "Thiết lập tài khoản"
                  : "Xác thực OTP"}
            </Text>
            <View style={styles.stepperRow}>
              <View style={[styles.stepDot, { backgroundColor: "#1a3a6b" }]} />
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: step >= 2 ? "#1a3a6b" : "#e2e8f0" },
                ]}
              />
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: step >= 3 ? "#1a3a6b" : "#e2e8f0" },
                ]}
              />
            </View>

            {step === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.fullName && styles.inputError,
                    ]}
                  >
                    <Ionicons name="person-outline" size={20} color="#1a3a6b" />
                    <TextInput
                      placeholder="Nguyễn Văn A"
                      onChangeText={(t) => handleChange("fullName", t)}
                      value={formData.fullName}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email sinh viên</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color="#1a3a6b" />
                    <TextInput
                      placeholder="name@student.iuh.edu.vn"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={(t) => handleChange("email", t)}
                      value={formData.email}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <View style={styles.rowContainer}>
                  <View
                    style={[styles.inputGroup, { flex: 1.2, marginRight: 10 }]}
                  >
                    <Text style={styles.inputLabel}>Ngày sinh</Text>
                    <TouchableOpacity
                      style={styles.inputWrapper}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#1a3a6b"
                      />
                      <Text style={styles.dateText}>
                        {formData.dateOfBirth.toLocaleDateString("vi-VN")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Giới tính</Text>
                    <View style={styles.genderBox}>
                      {["MALE", "FEMALE"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[
                            styles.genderBtn,
                            formData.gender === g && styles.genderBtnActive,
                          ]}
                          onPress={() => handleChange("gender", g)}
                        >
                          <Text
                            style={[
                              styles.genderBtnText,
                              formData.gender === g &&
                                styles.genderBtnTextActive,
                            ]}
                          >
                            {g === "MALE" ? "Nam" : "Nữ"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnPrimary} onPress={goToStep2}>
                  <Text style={styles.btnText}>TIẾP TỤC</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên đăng nhập (MSSV)</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.username && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="id-card-outline"
                      size={20}
                      color="#1a3a6b"
                    />
                    <TextInput
                      placeholder="21xxxxxx"
                      autoCapitalize="none"
                      onChangeText={(t) => handleChange("username", t)}
                      value={formData.username}
                      style={styles.textInput}
                    />
                  </View>
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
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      onChangeText={(t) => handleChange("password", t)}
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
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
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
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      onChangeText={(t) => handleChange("confirmPassword", t)}
                      style={styles.textInput}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>ĐĂNG KÝ</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={styles.btnBack}
                >
                  <Text style={styles.btnBackText}>Quay lại</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.otpLabel}>
                  Nhập mã xác thực đã gửi đến email của bạn
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
                  disabled={resendCountdown > 0 || isLoading}
                  onPress={() => {}}
                  style={{ alignSelf: "center", marginTop: 10 }}
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
                  onPress={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>XÁC THỰC NGAY</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  style={styles.btnBack}
                >
                  <Text style={styles.btnBackText}>Sửa tài khoản</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.linkText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) handleChange("dateOfBirth", d);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

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
  logoSection: { alignItems: "center", marginTop: 30, marginBottom: 20 },
  logo: { height: 110, width: width * 0.7 },

  // Form Card
  formCard: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1a3a6b",
    textAlign: "left",
  },
  stepperRow: { flexDirection: "row", gap: 8, marginVertical: 20 },
  stepDot: { height: 6, width: 40, borderRadius: 3 },

  // Input Groups
  stepContainer: { gap: 18 },
  inputGroup: { gap: 8 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
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
    height: 58, // Tăng kích thước bằng bên login
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fff1f2" },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  dateText: {
    marginLeft: 12,
    color: "#1e293b",
    fontWeight: "500",
    fontSize: 16,
  },

  rowContainer: { flexDirection: "row", alignItems: "flex-end" },
  genderBox: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    height: 58,
    alignItems: "center",
  },
  genderBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  genderBtnActive: { backgroundColor: "#1a3a6b" },
  genderBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
  genderBtnTextActive: { color: "#ffffff" },

  // Buttons
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
    shadowRadius: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  btnBack: { alignSelf: "center", marginTop: 10 },
  btnBackText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  // OTP Square Boxes
  otpLabel: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginBottom: 10,
  },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  otpBox: {
    width: (width - 80) / 6,
    height: 60,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a3a6b",
  },
  resendText: {
    color: "#1a3a6b",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 15,
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
