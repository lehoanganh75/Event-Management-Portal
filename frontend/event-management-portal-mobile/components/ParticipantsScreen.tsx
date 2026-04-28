import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

export default function ParticipantsScreen({ event }: { event: Event }) {
  const [search, setSearch] = useState("");
  const registrations = event.registrations || [];

  const filtered = registrations.filter((r) =>
    r.participantAccountId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Tìm MSSV..."
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.participantAccountId.slice(-2)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.name}>{item.participantAccountId}</Text>
              <Text style={styles.date}>
                {new Date(item.registeredAt).toLocaleDateString()}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.checkedIn ? "#dcfce7" : "#f1f5f9" },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.checkedIn ? "#16a34a" : "#64748b" },
                ]}
              >
                {item.checkedIn ? "Đã đến" : "Vắng"}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  searchBar: {
    flexDirection: "row",
    margin: 20,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  input: { flex: 1, marginLeft: 10 },
  card: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  date: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
});
