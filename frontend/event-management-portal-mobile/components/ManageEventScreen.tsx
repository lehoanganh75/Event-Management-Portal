import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ManageEventScreen({ event }: { event: Event }) {
  const router = useRouter();

  const stats = [
    {
      label: "Đăng ký",
      value: event.registeredCount,
      icon: "people",
      color: "#3b82f6",
    },
    {
      label: "Giới hạn",
      value: event.maxParticipants,
      icon: "stats-chart",
      color: "#10b981",
    },
    {
      label: "Check-in",
      value: event.registrations?.filter((r) => r.checkedIn).length || 0,
      icon: "qr-code",
      color: "#f59e0b",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Image source={{ uri: event.coverImage }} style={styles.headerImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.statusText}>Trạng thái: {event.status}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Ionicons name={s.icon as any} size={20} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Công cụ quản trị</Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push(`/manage-event/participants/${event.id}`)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "#eff6ff" }]}>
          <Ionicons name="list" size={24} color="#3b82f6" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuLabel}>Danh sách người tham gia</Text>
          <Text style={styles.menuSub}>
            Quản lý, tìm kiếm và duyệt danh sách
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push(`/manage-event/scanner/${event.id}`)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "#f0fdf4" }]}>
          <Ionicons name="scan" size={24} color="#10b981" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuLabel}>Quét mã điểm danh</Text>
          <Text style={styles.menuSub}>Sử dụng camera để check-in nhanh</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20 },
  headerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
  },
  headerImage: { width: 70, height: 70, borderRadius: 15 },
  headerInfo: { flex: 1, marginLeft: 15, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  statusText: { fontSize: 12, color: "#64748b", marginTop: 4 },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statBox: {
    width: "31%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: "800", marginVertical: 4 },
  statLabel: { fontSize: 10, color: "#94a3b8", textTransform: "uppercase" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1e293b",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1, marginLeft: 15 },
  menuLabel: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  menuSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
});
