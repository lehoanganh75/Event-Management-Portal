import { getEventById } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParticipantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ATTENDED, REGISTERED

  useEffect(() => {
    if (id) {
      getEventById(id)
        .then((data) => setEvent(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Logic lọc danh sách dựa trên tìm kiếm và trạng thái
  const filteredParticipants =
    event?.registrations?.filter((reg: any) => {
      const matchesSearch =
        reg.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.participantAccountId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (filterStatus === "ALL") return matchesSearch;
      if (filterStatus === "ATTENDED") return matchesSearch && reg.checkedIn;
      if (filterStatus === "REGISTERED") return matchesSearch && !reg.checkedIn;
      return matchesSearch;
    }) || [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Người tham gia</Text>
          <Text style={styles.headerSub}>
            {event?.registrations?.length || 0} sinh viên đã đăng ký
          </Text>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Tìm theo Ticket Code, MSSV..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {["ALL", "ATTENDED", "REGISTERED"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === status && styles.filterTextActive,
                ]}
              >
                {status === "ALL"
                  ? "Tất cả"
                  : status === "ATTENDED"
                    ? "Đã đến"
                    : "Chưa đến"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredParticipants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <View style={styles.participantCard}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: item.checkedIn ? "#10b981" : "#cbd5e1" },
              ]}
            />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.ticketCode}>{item.ticketCode}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.checkedIn ? "#ecfdf5" : "#f1f5f9" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.checkedIn ? "#10b981" : "#64748b" },
                    ]}
                  >
                    {item.checkedIn ? "ĐÃ CHECK-IN" : "CHỜ"}
                  </Text>
                </View>
              </View>
              <Text style={styles.participantId}>
                ID: {item.participantAccountId}
              </Text>
              <Text style={styles.regDate}>
                Đăng ký:{" "}
                {new Date(item.registeredAt).toLocaleDateString("vi-VN")}
              </Text>

              {item.checkedIn && (
                <View style={styles.checkInTimeBox}>
                  <Ionicons name="time-outline" size={12} color="#10b981" />
                  <Text style={styles.checkInTimeText}>
                    Vào lúc:{" "}
                    {new Date(item.checkInTime).toLocaleTimeString("vi-VN")}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.detailBtn}>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không tìm thấy sinh viên nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 12 },
  headerTextContainer: { marginLeft: 16 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1e293b" },
  headerSub: { fontSize: 13, color: "#64748b", marginTop: 2 },

  searchSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },

  filterRow: { flexDirection: "row", marginTop: 15, gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  filterChipActive: { backgroundColor: "#7c3aed" },
  filterText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  filterTextActive: { color: "#fff" },

  listPadding: { padding: 20, paddingBottom: 40 },
  participantCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statusIndicator: { width: 4, height: "80%", borderRadius: 2 },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketCode: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  participantId: { fontSize: 13, color: "#64748b" },
  regDate: { fontSize: 11, color: "#94a3b8", marginTop: 4 },

  checkInTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  checkInTimeText: { fontSize: 11, color: "#10b981", fontWeight: "600" },

  detailBtn: { padding: 4 },
  emptyBox: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#94a3b8", marginTop: 10, fontWeight: "600" },
});
