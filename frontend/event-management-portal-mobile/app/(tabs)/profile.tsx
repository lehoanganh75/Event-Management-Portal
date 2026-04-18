import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { getMyEventsByRole } from "@/services/events";
import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- Các Component Phụ (Sub-components) ---
const StatItem = ({ label, value, icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconCircle, { backgroundColor: color }]}>
      <Ionicons name={icon} size={18} color="white" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuLink = ({
  title,
  icon,
  subtitle,
  onPress,
  isDestructive = false,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.menuItem}
  >
    <View style={styles.menuIconContainer}>
      <Ionicons
        name={icon}
        size={20}
        color={isDestructive ? "#ef4444" : "#1a479a"}
      />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuTitle, isDestructive && { color: "#ef4444" }]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
  </TouchableOpacity>
);

// --- Component Chính (Main Screen) ---
export default function ProfileScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("ALL");

  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        setPageLoading(true);
        try {
          const data = await getMyEventsByRole(activeRole);
          setEvents(data || []);
        } catch (error) {
          console.error("Lỗi fetch sự kiện tại Profile:", error);
        } finally {
          setPageLoading(false);
        }
      };
      fetchEvents();
    }
  }, [user, activeRole]);

  const participationCount = useMemo(() => events?.length || 0, [events]);

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#1a479a" />
      </View>
    );
  }

  return (
    <Layout>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.container}
      >
        {/* --- Header Profile --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Trang cá nhân</Text>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Image
                source={{
                  uri:
                    user?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=random&color=fff`,
                }}
                style={styles.avatarImage}
                transition={500}
              />
            </View>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#1a479a" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userInfo}>
            {user?.username} • {user?.role}
          </Text>
        </View>

        {/* --- Stats Floating Row --- */}
        <View style={styles.statsFloatingRow}>
          <StatItem
            label="Đã tham gia"
            value={pageLoading ? "..." : String(participationCount)}
            icon="checkmark-circle"
            color="#3b82f6"
          />
          <StatItem label="Điểm RL" value="--" icon="star" color="#fbbf24" />
          <StatItem
            label="Trạng thái"
            value={user?.status === "ACTIVE" ? "Active" : "Khóa"}
            icon="shield-checkmark"
            color="#10b981"
          />
        </View>

        {/* --- Main Content --- */}
        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.qrBanner} activeOpacity={0.9}>
            <View style={styles.qrIconBox}>
              <Ionicons name="qr-code" size={28} color="#1a479a" />
            </View>
            <View style={styles.qrTextContainer}>
              <Text style={styles.qrTitle}>MÃ QR C CỦA TÔI</Text>
              <Text style={styles.qrSub}>Dùng để điểm danh sự kiện nhanh</Text>
            </View>
            <Ionicons name="chevron-forward-circle" size={24} color="#1a479a" />
          </TouchableOpacity>

          <View style={styles.menuGroup}>
            <Text style={styles.groupLabel}>Cài đặt tài khoản</Text>
            <MenuLink
              title="Thông tin chi tiết"
              icon="person-outline"
              subtitle={user?.email}
              onPress={() => router.push("/user-details")}
            />
            <MenuLink
              title="Lịch sử sự kiện"
              icon="time-outline"
              subtitle="Sự kiện bạn đã tham gia"
              onPress={() => router.push("/user-details")}
            />
          </View>

          <View style={styles.menuGroup}>
            <Text style={styles.groupLabel}>Hệ thống</Text>
            <MenuLink title="Cài đặt thông báo" icon="notifications-outline" />
            <MenuLink
              title="Đăng xuất"
              icon="log-out-outline"
              isDestructive={true}
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: { backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40 },
  headerContainer: {
    backgroundColor: "#1a479a",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    // GIẢM paddingBottom xuống còn khoảng 60-70 để thu hẹp khoảng cách phía dưới
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 3,
    // TĂNG: elevation và shadow để nổi bật hơn
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ffcc00",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1a479a",
    // TĂNG: elevation cho nút camera
    elevation: 15,
  },
  userName: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 12 },
  userInfo: { color: "#bfdbfe", fontSize: 13, marginTop: 2, opacity: 0.8 },
  statsFloatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    // GIẢM khoảng cách: Giảm marginTop âm từ -45 xuống -30
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    // TĂNG: elevation và shadow để làm nổi bật cụm thống kê
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#1e293b" },
  statLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
  mainContent: {
    // TĂNG: marginTop để tạo khoảng cách hợp lý với cụm stats mới
    marginTop: 40,
    paddingHorizontal: 20,
  },
  qrBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginBottom: 20,
  },
  qrIconBox: { backgroundColor: "#fff", padding: 8, borderRadius: 10 },
  qrTextContainer: { flex: 1, marginLeft: 12 },
  qrTitle: { color: "#1a479a", fontWeight: "bold", fontSize: 14 },
  qrSub: { color: "#64748b", fontSize: 11, marginTop: 2 },
  menuGroup: { marginBottom: 20 },
  groupLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 14, fontWeight: "600", color: "#334155" },
  menuSubtitle: { fontSize: 10, color: "#94a3b8", marginTop: 1 },
});
