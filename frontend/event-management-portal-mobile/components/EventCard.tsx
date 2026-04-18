import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EventCard = ({
  item,
  onPress,
}: {
  item: any;
  onPress: (id: string) => void;
}) => {
  const availableSlots = item.maxParticipants - item.registeredCount;
  const isFull = availableSlots <= 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.contentRow}>
        <Image
          source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.infoContainer}>
          <View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color="#64748b" />
              <Text style={styles.dateText}>{item.eventDate}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View
              style={[
                styles.statusBadge,
                isFull ? styles.badgeFull : styles.badgeAvailable,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isFull ? styles.textFull : styles.textAvailable,
                ]}
              >
                {isFull ? "Hết chỗ" : `Còn ${availableSlots} chỗ`}
              </Text>
            </View>

            <View style={styles.participantsContainer}>
              <Ionicons name="people-outline" size={12} color="#94a3b8" />
              <Text style={styles.participantsText}>
                {item.registeredCount}/{item.maxParticipants}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Shadow cho Android
    elevation: 2,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    padding: 12,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    color: "#64748b",
    fontSize: 10,
    marginLeft: 4,
  },
  title: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeAvailable: {
    backgroundColor: "#ecfdf5",
  },
  badgeFull: {
    backgroundColor: "#fef2f2",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  textAvailable: {
    color: "#059669",
  },
  textFull: {
    color: "#dc2626",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    color: "#94a3b8",
    fontSize: 10,
    marginLeft: 4,
  },
});

export default EventCard;
