import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import EventCard from './EventCard';
import FilterModal from './FilterModal';
import QuickAccess from './QuickAccess';

const { width } = Dimensions.get('window');

// --- MAIN COMPONENT ---
const EventFeed = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [events, setEvents] = useState<any[]>([]); // Gán dữ liệu API vào đây

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <StatusBar style="dark" />

      {/* Header & Search */}
      <View className="bg-white px-4 pt-4 pb-2 border-b border-slate-100">
        <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Tìm kiếm sự kiện tại IUH..."
            className="flex-1 ml-3 text-sm font-medium"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={20} color="#1d4ed8" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <QuickAccess />
            <View className="px-5 py-4 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-slate-800">Bảng tin sự kiện</Text>
              <Text className="text-slate-400 text-xs">{events.length} kết quả</Text>
            </View>
          </>
        }
        data={events} // Thay bằng dữ liệu từ API
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard item={item} onPress={(id) => router.push(`/events/${id}` as any)} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Ionicons name="newspaper-outline" size={60} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4">Không tìm thấy sự kiện nào</Text>
          </View>
        }
      />

      {/* Floating Buttons */}
      <View className="absolute bottom-8 right-6 space-y-4">
        <TouchableOpacity className="w-14 h-14 bg-[#ffcc00] rounded-full items-center justify-center shadow-lg">
          <Ionicons name="gift" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg">
          <Ionicons name="sparkles" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} />
    </View>
  );
}

export default EventFeed;