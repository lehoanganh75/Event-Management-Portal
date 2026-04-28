import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from "react-native";

const QuickAccess = () => {
  const router = useRouter();
  
  const items = [
    { icon: 'notifications-outline', label: 'Thông báo', link: '/notifications' },
    { icon: 'calendar-outline', label: 'Đang diễn ra', link: '/home?status=ongoing' },
    { icon: 'checkmark-circle-outline', label: 'Điểm danh', link: '/checkin' },
    { icon: 'bookmarks-outline', label: 'Đã tham gia', link: '/my-events' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.link as any)}
            activeOpacity={0.7}
            style={styles.itemButton}
          >
            <Ionicons name={item.icon as any} size={16} color="#1d4ed8" />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16, // Tạo khoảng trống ở hai đầu danh sách khi cuộn
  },
  itemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff", // blue-50
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#dbeafe", // blue-100
    // Đổ bóng nhẹ cho nút
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLabel: {
    marginLeft: 8,
    color: "#1d4ed8", // blue-700
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default QuickAccess;