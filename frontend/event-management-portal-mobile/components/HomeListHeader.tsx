import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient"; // Đảm bảo đã cài expo-linear-gradient
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface HomeListHeaderProps {
  loading: boolean;
  ongoingEvents: any[];
  totalParticipants: number;
}

const HomeListHeader: React.FC<HomeListHeaderProps> = ({
  loading,
  ongoingEvents,
  totalParticipants,
}) => {
  const router = useRouter();

  return (
    <View style={styles.headerWrapper}>
      {/* HERO SECTION */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={["#1e40af", "#245bb5"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Hệ thống sự kiện thông minh 4.0</Text>
        </View>

        <Text style={styles.welcomeText}>Chào mừng đến với</Text>
        <Text style={styles.brandTitle}>
          Sự Kiện IUH <Text style={styles.highlightYear}>2026</Text>
        </Text>

        <Text style={styles.description}>
          Số hóa trải nghiệm sinh viên qua nền tảng AI, điểm danh QR nhanh chóng
          và các hoạt động tương tác hiện đại.
        </Text>

        {/* Stats Card */}
        <View style={styles.glassStatsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="ribbon" size={20} color="#ffcc00" />
            </View>
            <View>
              <Text style={styles.statLabel}>QS Stars</Text>
              <Text style={styles.statSub}>4 Sao Quốc Tế</Text>
            </View>
          </View>
          <View style={styles.vSeparator} />
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="trophy" size={20} color="#ffcc00" />
            </View>
            <View>
              <Text style={styles.statLabel}>BXH Châu Á</Text>
              <Text style={styles.statSub}>Hạng #355</Text>
            </View>
          </View>
        </View>
      </View>

      {/* LIVE EVENTS */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.sectionTitle}>Đang diễn ra</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Text style={styles.viewAllText}>Tất cả sự kiện</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#245bb5" style={{ marginVertical: 40 }} />
        ) : (
          <FlatList
            horizontal
            data={ongoingEvents}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.modernCard}
                onPress={() => router.push(`/events/${item.id}`)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.cardOverlay}>
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTag}>{item.location}</Text>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Ionicons name="time-outline" size={12} color="#ddd" />
                      <Text style={styles.cardDate}>{item.eventDate}</Text>
                      <View style={styles.dot} />
                      <Text style={styles.cardReg}>
                        {item.registeredCount} đã đăng ký
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { backgroundColor: "#f8fafc" },
  heroContainer: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#1e3a8a",
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    alignSelf: "flex-start",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    backgroundColor: "#10b981",
    borderRadius: 3,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  welcomeText: { color: "#bfdbfe", fontSize: 16, fontWeight: "500" },
  brandTitle: { color: "white", fontSize: 34, fontWeight: "900", marginTop: 4 },
  highlightYear: { color: "#ffcc00" },
  description: {
    color: "#eff6ff",
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
    marginTop: 15,
    marginBottom: 25,
  },

  glassStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statLabel: { color: "white", fontWeight: "800", fontSize: 14 },
  statSub: { color: "#dbeafe", fontSize: 10, fontWeight: "500" },
  vSeparator: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
    maxHeight: 10,
  },

  sectionContainer: { marginTop: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  row: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { color: "#1e293b", fontSize: 20, fontWeight: "800" },
  liveIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  viewAllText: { color: "#2563eb", fontSize: 13, fontWeight: "700" },

  horizontalListContent: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 15,
  },
  modernCard: {
    width: width * 0.7,
    height: 180,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 8,
  },
  cardImage: { ...StyleSheet.absoluteFillObject },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: "flex-end",
  },
  cardTag: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "rgba(37, 99, 235, 0.8)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardFooter: { flexDirection: "row", alignItems: "center" },
  cardDate: { color: "#ddd", fontSize: 11, marginLeft: 4 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#888",
    marginHorizontal: 6,
  },
  cardReg: { color: "#ddd", fontSize: 11 },

  infoBanner: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bannerTitle: { color: "#1e293b", fontWeight: "800", fontSize: 18 },
  bannerSub: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  feedHeader: {
    paddingHorizontal: 24,
    marginTop: 35,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  vLine: {
    width: 4,
    height: 20,
    backgroundColor: "#2563eb",
    borderRadius: 2,
    marginRight: 10,
  },
  feedTitle: { color: "#1e293b", fontSize: 20, fontWeight: "800" },
});

export default HomeListHeader;
