import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const formatDateTimeShort = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} - ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function EventFeed({ events = [] }: { events: Event[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Lọc theo từ khóa tìm kiếm
  const filteredEvents = Array.isArray(events)
    ? events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  const renderEventItem = (item: Event) => (
    <TouchableOpacity
      key={item.id} // Quan trọng khi dùng map
      activeOpacity={0.8}
      style={styles.eventCard}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      <Image source={{ uri: item.coverImage }} style={styles.thumbnail} />

      <View style={styles.contentRight}>
        <View>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={13} color="#3b82f6" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color="#64748b" />
            <Text style={styles.infoText}>
              {formatDateTimeShort(item.startTime)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.regCountBox}>
            <Ionicons name="people-circle" size={14} color="#94a3b8" />
            <Text style={styles.countText}>
              {item.registeredCount || 0} bạn
            </Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Tìm sự kiện trong tuần..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.vLine} />
        <Text style={styles.sectionTitle}>Sự kiện sắp tới</Text>
      </View>

      <View style={styles.listPadding}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((item) => renderEventItem(item))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              Không có sự kiện nào trong tuần này
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  vLine: {
    width: 4,
    height: 18,
    backgroundColor: "#2563eb",
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },

  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: "row",
    padding: 12,
    // Shadow
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  contentRight: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 20,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  regCountBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
});
