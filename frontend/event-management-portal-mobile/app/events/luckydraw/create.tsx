import { getEventById } from "@/services/events";
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

export default function CreateLuckyDrawScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    allowMultipleWins: false,
  });

  const [prizes, setPrizes] = useState<Prize[]>([
    { name: "", quantity: 1, winProbabilityPercent: 0 },
  ]);

  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then((data: any) => {
          setEvent(data);
          setForm({
            title: `Vòng quay: ${data.title}`,
            description: `Chương trình quay thưởng dành cho khách tham dự ${data.title}`,
            startTime: data.startTime,
            endTime: data.endTime,
            allowMultipleWins: false,
          });
        })
        .catch((err) => console.error("Lỗi lấy event:", err));
    }
  }, [eventId]);

  const addPrize = () => {
    if (currentUserTotal >= 100) {
      return Alert.alert(
        "Thông báo",
        "Tỉ lệ đã đạt 100%, không thể thêm giải mới có tỉ lệ.",
      );
    }
    setPrizes([...prizes, { name: "", quantity: 1, winProbabilityPercent: 0 }]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  // Logic cập nhật prize kèm khống chế tỉ lệ 100%
  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const newPrizes = [...prizes];

    if (field === "winProbabilityPercent") {
      let numValue = parseFloat(value) || 0;
      if (numValue < 0) numValue = 0;

      const otherTotal = prizes.reduce(
        (sum, p, i) =>
          i !== index ? sum + Number(p.winProbabilityPercent) : sum,
        0,
      );

      if (otherTotal + numValue > 100) {
        numValue = parseFloat((100 - otherTotal).toFixed(2));
        Alert.alert("Giới hạn", "Tổng tỉ lệ không được vượt quá 100%");
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

  const handleSave = async () => {
    if (!form.title) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
    if (prizes.some((p) => !p.name))
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên các giải thưởng");

    // Tự động chèn giải mặc định "May mắn lần sau"
    const finalPrizes = [...prizes];
    finalPrizes.push({
      name: "Chúc bạn may mắn lần sau",
      quantity: 999999,
      winProbabilityPercent: parseFloat(autoProb),
    });

    setLoading(true);
    try {
      const payload = { ...form, eventId, prizes: finalPrizes };
      await luckyDrawService.create(payload);
      Alert.alert("Thành công", `Đã tạo vòng quay!`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tạo vòng quay",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thiết lập vòng quay</Text>
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
              placeholder="Tiêu đề vòng quay"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chương trình"
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          {/* Thanh trạng thái tỉ lệ % */}
          <View style={styles.statusContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>PHÂN BỔ TỈ LỆ (%)</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: currentUserTotal >= 100 ? "#ef4444" : "#10b981" },
                ]}
              >
                {currentUserTotal.toFixed(2)}% / 100%
              </Text>
            </View>
            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${currentUserTotal}%`,
                    backgroundColor:
                      currentUserTotal >= 100 ? "#ef4444" : "#10b981",
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>DANH SÁCH GIẢI THƯỞNG</Text>
              <TouchableOpacity onPress={addPrize} style={styles.addBtn}>
                <Ionicons name="add-circle" size={20} color="#10b981" />
                <Text style={styles.addBtnText}>Thêm giải</Text>
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
                  placeholder="Tên giải thưởng"
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
                      placeholder="0.0"
                      value={String(prize.winProbabilityPercent)}
                      onChangeText={(val) =>
                        updatePrize(index, "winProbabilityPercent", val)
                      }
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Giải mặc định tự động */}
            <View
              style={[
                styles.prizeCard,
                { backgroundColor: "#f8fafc", borderStyle: "dashed" },
              ]}
            >
              <View style={styles.prizeHeader}>
                <Text style={[styles.prizeIndex, { color: "#64748b" }]}>
                  MẶC ĐỊNH (CÒN LẠI)
                </Text>
                <Ionicons name="lock-closed" size={14} color="#94a3b8" />
              </View>
              <TextInput
                style={[styles.prizeInput, { color: "#94a3b8" }]}
                value="Chúc bạn may mắn lần sau"
                editable={false}
              />
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.miniLabel}>Số lượng</Text>
                  <TextInput
                    style={[styles.prizeInput, { color: "#94a3b8" }]}
                    value="Không giới hạn"
                    editable={false}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={styles.col}>
                  <Text style={styles.miniLabel}>Tỉ lệ tự động (%)</Text>
                  <View
                    style={[
                      styles.prizeInput,
                      { backgroundColor: "#e2e8f0", justifyContent: "center" },
                    ]}
                  >
                    <Text style={{ fontWeight: "800", color: "#1e293b" }}>
                      {autoProb}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>XÁC NHẬN TẠO VÒNG QUAY</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  statusText: { fontSize: 12, fontWeight: "800" },
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
    elevation: 2,
  },
  prizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  prizeIndex: { fontWeight: "800", color: "#64748b", fontSize: 12 },
  prizeInput: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    fontSize: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  miniLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 4,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
});
