import { getEventById, getTicketByEventId } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // eventId
  const router = useRouter();

  const [registration, setRegistration] = useState<any>(null);
  const [event, setEvent] = useState<any>(null); // State riêng cho event
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      // Gọi song song 2 API độc lập
      const [eventData, ticketData] = await Promise.all([
        getEventById(id),
        getTicketByEventId(id),
      ]);

      setEvent(eventData);
      setRegistration(ticketData);
    } catch (err: any) {
      console.error("Lỗi tải thông tin vé/sự kiện:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "Chưa cập nhật";
    const d = new Date(iso);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN")}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải dữ liệu vé...</Text>
      </View>
    );
  }

  // Kiểm tra nếu thiếu 1 trong 2 thông tin quan trọng
  if (!registration || !event) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#cbd5e1" />
        <Text style={styles.errorTitle}>Lỗi dữ liệu</Text>
        <Text style={styles.errorSub}>
          Không tìm thấy thông tin vé hoặc sự kiện tương ứng.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLinkBtn}
        >
          <Text style={styles.backLinkText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vé điện tử</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ticketWrapper}>
          <View style={styles.ticketCard}>
            {/* THÔNG TIN LẤY TỪ OBJECT EVENT */}
            <View style={styles.eventSection}>
              <Image
                source={{ uri: event.coverImage }}
                style={styles.eventImg}
                contentFit="cover"
              />
              <View style={styles.eventInfo}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{event.type}</Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.eventTime}>
                  {formatDateTime(event.startTime)}
                </Text>
              </View>
            </View>

            <View style={styles.ticketDivider}>
              <View style={styles.cutCircleLeft} />
              <View style={styles.dashLine} />
              <View style={styles.cutCircleRight} />
            </View>

            {/* THÔNG TIN LẤY TỪ OBJECT REGISTRATION */}
            <View style={styles.qrSection}>
              <Text style={styles.qrInstruction}>MÃ QR CHECK-IN CỦA BẠN</Text>
              <View style={styles.qrContainer}>
                {registration.qrToken ? (
                  <QRCode
                    value={registration.qrToken}
                    size={width * 0.5}
                    color="#1e293b"
                    backgroundColor="white"
                  />
                ) : (
                  <ActivityIndicator color="#2563eb" />
                )}
              </View>
              <Text style={styles.ticketCode}>{registration.ticketCode}</Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: registration.checkedIn
                      ? "#ecfdf5"
                      : "#fff7ed",
                  },
                ]}
              >
                <Ionicons
                  name={registration.checkedIn ? "checkmark-circle" : "time"}
                  size={16}
                  color={registration.checkedIn ? "#10b981" : "#ea580c"}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: registration.checkedIn ? "#10b981" : "#ea580c" },
                  ]}
                >
                  {registration.checkedIn ? "ĐÃ CHECK-IN" : registration.status}
                </Text>
              </View>
            </View>

            <View style={styles.footerSection}>
              <View style={styles.footerRow}>
                <View style={styles.footerItem}>
                  <Text style={styles.footerLabel}>ĐỊA ĐIỂM (TỪ EVENT)</Text>
                  <Text style={styles.footerValue} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
                <View style={styles.footerItem}>
                  <Text style={styles.footerLabel}>NGÀY ĐĂNG KÝ</Text>
                  <Text style={styles.footerValue}>
                    {new Date(registration.registeredAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#64748b"
          />
          <Text style={styles.warningText}>
            Lưu ý:{" "}
            {event.notes || "Vui lòng xuất trình mã này tại cổng hội trường."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: { marginTop: 15, color: "#64748b" },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 15,
  },
  errorSub: { textAlign: "center", color: "#94a3b8", marginTop: 8 },
  backLinkBtn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backLinkText: { color: "#fff", fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  scrollContent: { padding: 20, paddingBottom: 50 },
  ticketWrapper: {
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  ticketCard: { backgroundColor: "#fff", borderRadius: 30, overflow: "hidden" },
  eventSection: { flexDirection: "row", padding: 24, gap: 16 },
  eventImg: {
    width: 85,
    height: 85,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
  },
  eventInfo: { flex: 1, justifyContent: "center" },
  typeBadge: {
    backgroundColor: "#fbbf24",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeText: { fontSize: 9, fontWeight: "900", color: "#78350f" },
  eventTitle: { fontSize: 17, fontWeight: "900", color: "#1e293b" },
  eventTime: { fontSize: 13, color: "#64748b", marginTop: 6 },
  ticketDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    marginVertical: -20,
  },
  cutCircleLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f8fafc",
    marginLeft: -15,
  },
  cutCircleRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f8fafc",
    marginRight: -15,
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 10,
  },
  qrSection: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  qrInstruction: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  ticketCode: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e293b",
    marginTop: 15,
    letterSpacing: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusText: { fontSize: 11, fontWeight: "800" },
  footerSection: {
    padding: 24,
    backgroundColor: "#fcfcfc",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerRow: { flexDirection: "row", gap: 20 },
  footerItem: { flex: 1 },
  footerLabel: { fontSize: 9, color: "#94a3b8", fontWeight: "800" },
  footerValue: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "700",
    marginTop: 4,
  },
  warningBox: {
    flexDirection: "row",
    marginTop: 20,
    padding: 15,
    gap: 10,
    alignItems: "center",
  },
  warningText: { flex: 1, fontSize: 12, color: "#64748b" },
});
