import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";

const QuickAccess = () => {
  const router = useRouter();
  const items = [
    { icon: 'notifications-outline', label: 'Thông báo', link: '/notifications' },
    { icon: 'calendar-outline', label: 'Đang diễn ra', link: '/home?status=ongoing' },
    { icon: 'checkmark-circle-outline', label: 'Điểm danh', link: '/checkin' },
    { icon: 'bookmarks-outline', label: 'Đã tham gia', link: '/my-events' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-4 bg-white">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(item.link as any)}
          className="flex-row items-center bg-blue-50 px-4 py-2.5 rounded-full mr-3 border border-blue-100"
        >
          <Ionicons name={item.icon as any} size={16} color="#1d4ed8" />
          <Text className="ml-2 text-blue-700 font-bold text-xs">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default QuickAccess;