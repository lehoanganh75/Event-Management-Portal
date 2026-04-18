import { deleteEvent, getEventById } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        setLoading(true);
        getEventById(id)
          .then((data) => setEvent(data))
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      }
    }, [id]),
  );

  const handleDeleteEvent = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn hủy sự kiện này không? Tất cả dữ liệu vòng quay và người tham gia liên quan sẽ bị xóa mềm.",
      [
        { text: "Quay lại", style: "cancel" },
        {
          text: "Xác nhận xóa",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteEvent(id);
              Alert.alert(
                "Thành công",
                "Sự kiện đã được chuyển vào trạng thái đã xóa.",
                [{ text: "OK", onPress: () => router.replace("/(tabs)/home") }],
              );
            } catch (error: any) {
              const errorMsg =
                error.response?.data?.message ||
                "Không thể kết nối đến máy chủ";
              Alert.alert("Lỗi", errorMsg);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e293b" />
      </View>
    );
  }

  const AdminTool = ({ title, icon, color, onPress, sub }: any) => (
    <TouchableOpacity
      style={styles.toolCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.toolInfo}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="dark" />

      {/* HEADER MÀU TRẮNG */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Quản lý sự kiện
        </Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* EVENT HEADER CARD */}
        <View style={styles.eventHeaderCard}>
          <View style={styles.statusRow}>
            <View style={styles.activeDot} />
            <Text style={styles.eventSlug}>#{event?.id || "N/A"}</Text>
          </View>
          <Text style={styles.eventTitle}>{event?.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{event?.registeredCount || 0}</Text>
              <Text style={styles.statLab}>Đăng ký</Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{event?.maxParticipants || 0}</Text>
              <Text style={styles.statLab}>Giới hạn</Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: "#10b981" }]}>0</Text>
              <Text style={styles.statLab}>Check-in</Text>
            </View>
          </View>
        </View>

        {/* ADMIN TOOLS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CÔNG CỤ ĐIỀU HÀNH</Text>

          <AdminTool
            title="Quét mã QR"
            sub="Điểm danh sinh viên tham gia"
            icon="qr-code-outline"
            color="#2563eb"
            onPress={() => router.push(`/manage-event/scanner/${id}`)}
          />

          <AdminTool
            title="Danh sách tham gia"
            sub="Quản lý thông tin & phê duyệt"
            icon="people-outline"
            color="#7c3aed"
            onPress={() => router.push(`/manage-event/participants/${id}`)}
          />

          <AdminTool
            title="Chỉnh sửa sự kiện"
            sub="Thay đổi nội dung, thời gian"
            icon="create-outline"
            color="#f59e0b"
            onPress={() => {
              // Sửa link: Truyền id qua params để tránh Unmatched Route
              router.push({
                pathname: "/events/edit",
                params: { id: id },
              });
            }}
          />

          {/* HIỂN THỊ CÓ ĐIỀU KIỆN DỰA TRÊN hasLuckyDraw */}
          {event?.hasLuckyDraw ? (
            <AdminTool
              title="Vòng quay may mắn"
              sub="Quản lý bốc thăm trúng thưởng"
              icon="color-palette-outline"
              color="#ec4899"
              onPress={() => {
                router.push({
                  pathname: "/events/luckydraw", // Bỏ chữ /index đi
                  params: { id: id },
                });
              }}
            />
          ) : (
            <AdminTool
              title="Thiết lập Vòng quay"
              sub="Sự kiện này chưa có vòng quay"
              icon="add-circle-outline"
              color="#10b981" // Màu xanh lá để khuyến khích tạo mới
              onPress={() => {
                // Điều hướng đến trang tạo mới hoặc hiện modal thiết lập
                router.push({
                  pathname: "/events/luckydraw/create", // Hoặc đường dẫn tạo mới của bạn
                  params: { eventId: id },
                });
              }}
            />
          )}
        </View>

        {/* DANGER ZONE */}
        <View style={[styles.section, { marginTop: 20, marginBottom: 40 }]}>
          <TouchableOpacity
            style={[styles.dangerBtn, isDeleting && { opacity: 0.6 }]}
            onPress={handleDeleteEvent}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={styles.dangerBtnText}>
                  Hủy hoặc Tạm dừng sự kiện
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Lưu ý: Hành động này sẽ thực hiện "Xóa mềm". Dữ liệu sẽ không hiển
            thị trên ứng dụng của sinh viên nhưng vẫn được lưu trữ trong hệ
            thống quản trị.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 55, // Phù hợp với tai thỏ/notch
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    color: "#1e293b",
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },

  eventHeaderCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8,
  },
  eventSlug: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 20,
    lineHeight: 30,
  },

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "800", color: "#1e293b" },
  statLab: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  vLine: { width: 1, height: 30, backgroundColor: "#e2e8f0" },

  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 1.5,
  },

  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    // Tạo độ nổi nhẹ
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toolInfo: { flex: 1, marginLeft: 16 },
  toolTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  toolSub: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "500" },

  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#fee2e2",
    gap: 10,
  },
  dangerBtnText: { color: "#ef4444", fontWeight: "800", fontSize: 14 },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
