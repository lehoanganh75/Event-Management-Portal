import { luckyDrawService } from "@/services/luckydraw";
import { Prize } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UpdateLuckyDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Đây là LuckyDraw ID (UUID)
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    allowMultipleWins: false,
  });

  const [prizes, setPrizes] = useState<Prize[]>([]);

  // 1. Lấy dữ liệu cũ của Vòng quay
  useEffect(() => {
    if (id) {
      luckyDrawService
        .getById(id) // SỬA TẠI ĐÂY: Dùng getById thay vì getEntry
        .then((data: any) => {
          if (data) {
            setForm({
              title: data.title || "",
              description: data.description || "",
              startTime: data.startTime || "",
              endTime: data.endTime || "",
              allowMultipleWins: data.allowMultipleWins || false,
            });

            // Lọc bỏ giải mặc định để Admin chỉ sửa giải họ đã thêm
            const userPrizes = data.prizes.filter(
              (p: any) => p.name !== "Chúc bạn may mắn lần sau",
            );
            setPrizes(userPrizes);
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy thông tin vòng quay:", err);
          Alert.alert("Lỗi", "Không thể tải thông tin vòng quay");
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const addPrize = () => {
    if (currentUserTotal >= 100)
      return Alert.alert("Giới hạn", "Tỉ lệ đã đạt 100%");
    setPrizes([...prizes, { name: "", quantity: 1, winProbabilityPercent: 0 }]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 0) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const newPrizes = [...prizes];
    if (field === "winProbabilityPercent") {
      let numValue = parseFloat(value) || 0;
      const otherTotal = prizes.reduce(
        (sum, p, i) =>
          i !== index ? sum + Number(p.winProbabilityPercent) : sum,
        0,
      );
      if (otherTotal + numValue > 100) {
        numValue = parseFloat((100 - otherTotal).toFixed(2));
      }
      newPrizes[index] = { ...newPrizes[index], [field]: numValue };
    } else {
      newPrizes[index] = { ...newPrizes[index], [field]: value };
    }
    setPrizes(newPrizes);
  };

  const currentUserTotal = prizes.reduce(
    (sum, p) => sum + Number(p.winProbabilityPercent),
    0,
  );
  const autoProb = Math.max(0, 100 - currentUserTotal).toFixed(2);

  const handleUpdate = async () => {
    if (!form.title) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");

    const finalPrizes = [...prizes];
    finalPrizes.push({
      name: "Chúc bạn may mắn lần sau",
      quantity: 999999,
      winProbabilityPercent: parseFloat(autoProb),
    });

    setLoading(true);
    try {
      await luckyDrawService.update(id, { ...form, prizes: finalPrizes });
      Alert.alert("Thành công", "Đã cập nhật vòng quay!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a6b" />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật vòng quay</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>THÔNG TIN CHUNG</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả"
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.statusContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>
                TỔNG TỈ LỆ: {currentUserTotal.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${currentUserTotal}%`, backgroundColor: "#10b981" },
                ]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>GIẢI THƯỞNG</Text>
              <TouchableOpacity onPress={addPrize} style={styles.addBtn}>
                <Ionicons name="add-circle" size={20} color="#10b981" />
                <Text style={styles.addBtnText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {prizes.map((prize, index) => (
              <View key={index} style={styles.prizeCard}>
                <View style={styles.prizeHeader}>
                  <Text style={styles.prizeIndex}>Giải #{index + 1}</Text>
                  <TouchableOpacity onPress={() => removePrize(index)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.prizeInput}
                  value={prize.name}
                  onChangeText={(val) => updatePrize(index, "name", val)}
                />
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.miniLabel}>Số lượng</Text>
                    <TextInput
                      style={styles.prizeInput}
                      keyboardType="numeric"
                      value={String(prize.quantity)}
                      onChangeText={(val) =>
                        updatePrize(index, "quantity", parseInt(val) || 0)
                      }
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={styles.col}>
                    <Text style={styles.miniLabel}>Tỉ lệ (%)</Text>
                    <TextInput
                      style={styles.prizeInput}
                      keyboardType="numeric"
                      value={String(prize.winProbabilityPercent)}
                      onChangeText={(val) =>
                        updatePrize(index, "winProbabilityPercent", val)
                      }
                    />
                  </View>
                </View>
              </View>
            ))}

            <View
              style={[
                styles.prizeCard,
                { backgroundColor: "#f8fafc", borderStyle: "dashed" },
              ]}
            >
              <Text style={styles.prizeIndex}>GIẢI MẶC ĐỊNH (TỰ ĐỘNG)</Text>
              <View style={styles.row}>
                <Text style={{ flex: 1, color: "#94a3b8" }}>
                  Chúc bạn may mắn lần sau
                </Text>
                <Text style={{ fontWeight: "800" }}>{autoProb}%</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>LƯU THAY ĐỔI</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  scrollContent: { padding: 20 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  statusContainer: {
    marginBottom: 25,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#10b981", fontWeight: "700", fontSize: 13 },
  prizeCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  prizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  prizeIndex: {
    fontWeight: "800",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  },
  prizeInput: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    fontSize: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center" },
  col: { flex: 1 },
  miniLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
