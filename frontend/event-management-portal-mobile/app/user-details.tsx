import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { getMyEventsByRole } from "@/services/events";
import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Danh sách các vai trò lọc
const FILTER_ROLES = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang tham gia", value: "PARTICIPANT" },
  { label: "Ban tổ chức", value: "ORGANIZER" },
  { label: "Diễn giả", value: "PRESENTER" },
  { label: "Quản trị viên", value: "OWNER" },
  { label: "Đã tạo", value: "CREATOR" },
  { label: "Chờ phê duyệt", value: "APPROVER" },
];

export default function UserDetailsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEvents, setShowEvents] = useState(true); // Mặc định mở để thấy nền xám
  const [activeRole, setActiveRole] = useState("ALL");

  useEffect(() => {
    if (user) fetchEvents(activeRole);
  }, [activeRole, user]);

  const fetchEvents = async (role: string) => {
    setLoading(true);
    try {
      const data = await getMyEventsByRole(role);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const InfoRow = ({ label, value, icon }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Chưa cập nhật"}</Text>
      </View>
    </View>
  );

  return (
    <Layout>
      <View style={styles.mainWrapper}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ & Sự kiện</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={showEvents ? events : []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Thẻ thông tin cá nhân */}
              <View style={styles.card}>
                <InfoRow
                  label="Họ và tên"
                  value={user.fullName}
                  icon="person-outline"
                />
                <InfoRow label="Email" value={user.email} icon="mail-outline" />
                <InfoRow
                  label="Vai trò hệ thống"
                  value={user.role}
                  icon="shield-checkmark-outline"
                />
              </View>

              {/* Nút bật/tắt danh sách sự kiện */}
              <TouchableOpacity
                style={[
                  styles.eventToggleBtn,
                  showEvents && styles.eventToggleBtnActive,
                ]}
                onPress={() => setShowEvents(!showEvents)}
                activeOpacity={0.8}
              >
                <View style={styles.toggleLeft}>
                  <View
                    style={[
                      styles.eventIconBox,
                      showEvents && {
                        backgroundColor: "rgba(255,255,255,0.2)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={showEvents ? "#fff" : "#2563eb"}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.toggleTitle,
                        showEvents && { color: "#fff" },
                      ]}
                    >
                      Sự kiện của tôi
                    </Text>
                    <Text
                      style={[
                        styles.toggleSub,
                        showEvents && { color: "#dbeafe" },
                      ]}
                    >
                      {events.length} sự kiện liên quan
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={showEvents ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={showEvents ? "#fff" : "#64748b"}
                />
              </TouchableOpacity>

              {/* Thanh lọc Role */}
              {showEvents && (
                <View style={styles.filterWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    {FILTER_ROLES.map((role) => (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.filterChip,
                          activeRole === role.value && styles.filterChipActive,
                        ]}
                        onPress={() => setActiveRole(role.value)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            activeRole === role.value &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {loading && showEvents && (
                <ActivityIndicator
                  style={{ marginVertical: 30 }}
                  color="#2563eb"
                />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventItem}
              onPress={() => router.push(`/events/${item.id}`)}
            >
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDateDay}>
                  {new Date(item.startTime).getDate()}
                </Text>
                <Text style={styles.eventDateMonth}>
                  Th{new Date(item.startTime).getMonth() + 1}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.eventLocation} numberOfLines={1}>
                  <Ionicons name="location-outline" size={12} /> {item.location}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            showEvents && !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
                <Text style={styles.emptyText}>
                  Không tìm thấy sự kiện nào.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#f8fafc", // Màu xám nhạt phủ toàn bộ
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  backBtn: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 12 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#1e293b" },

  listContent: {
    paddingBottom: 50,
    backgroundColor: "#f8fafc", // Đảm bảo nền xám bên trong FlatList
  },

  card: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  iconBox: {
    width: 42,
    height: 42,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { fontSize: 15, color: "#1e293b", fontWeight: "700", marginTop: 2 },

  eventToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  eventToggleBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    elevation: 8,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  eventIconBox: {
    width: 46,
    height: 46,
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  toggleSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  filterWrapper: { marginTop: 18, marginBottom: 8 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
  },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  filterChipTextActive: { color: "#fff" },

  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  eventDateBox: {
    alignItems: "center",
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: "#f1f5f9",
    width: 55,
  },
  eventDateDay: { fontSize: 18, fontWeight: "800", color: "#2563eb" },
  eventDateMonth: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  eventInfo: { flex: 1, paddingLeft: 14 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  eventLocation: { fontSize: 12, color: "#64748b", marginTop: 4 },

  emptyContainer: { paddingVertical: 60, alignItems: "center", gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
});
