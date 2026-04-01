import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

const EventCard = ({ item, onPress }: { item: any; onPress: (id: string) => void }) => {
  const availableSlots = item.maxParticipants - item.registeredCount;
  const isFull = availableSlots <= 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
      className="bg-white mx-4 mb-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <View className="flex-row p-3">
        <Image
          source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
          className="w-24 h-24 rounded-2xl bg-slate-200"
        />
        <View className="flex-1 ml-4 justify-between">
          <View>
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar-outline" size={12} color="#64748b" />
              <Text className="text-slate-400 text-[10px] ml-1">{item.eventDate}</Text>
            </View>
            <Text className="text-slate-800 font-bold text-sm leading-5" numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className={`px-2 py-1 rounded-full ${isFull ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <Text className={`text-[9px] font-bold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                {isFull ? 'Hết chỗ' : `Còn ${availableSlots} chỗ`}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={12} color="#94a3b8" />
              <Text className="text-slate-400 text-[10px] ml-1">
                {item.registeredCount}/{item.maxParticipants}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;