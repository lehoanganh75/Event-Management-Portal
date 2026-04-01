import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Layout from '@/components/Layout';
import EventFeed from '@/components/EventFeed';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Gọi API thực tế của bạn ở đây
      // const res = await getFeaturedEvents();
      // Giả lập dữ liệu
      const mockData = [
        { id: '1', title: 'Hội thảo AI 2026', location: 'Hội trường E4', eventDate: '15/04', registeredCount: 150 },
        { id: '2', title: 'Ngày hội Việc làm', location: 'Sân nhà A', eventDate: '20/04', registeredCount: 500 },
      ];
      setFeaturedEvents(mockData);
      setTotalParticipants(650);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <Layout>
      <StatusBar style="light" />
      <ScrollView 
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* --- HERO SECTION --- */}
        <View className="bg-[#245bb5] pt-12 pb-10 px-6 rounded-b-[40px] shadow-lg">
          {/* Badge */}
          <View className="flex-row items-center bg-white/10 self-start px-3 py-1.5 rounded-full border border-white/20 mb-6">
            <View className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
            <Text className="text-white text-[9px] font-bold uppercase tracking-widest">
              Hệ thống sự kiện thông minh 4.0
            </Text>
          </View>

          <Text className="text-blue-100 text-lg font-light mb-1">Chào mừng đến với</Text>
          <Text className="text-white text-4xl font-black mb-4">
            Sự Kiện IUH <Text className="text-[#ffcc00]">2026</Text>
          </Text>

          <Text className="text-blue-50 text-sm leading-5 opacity-80 mb-8">
            Nền tảng tích hợp AI hỗ trợ tổ chức sự kiện, điểm danh QR Code và Vòng quay may mắn.
          </Text>

          {/* Stats Row */}
          <View className="flex-row justify-between items-center bg-white/10 p-4 rounded-3xl border border-white/10 mb-2">
            <View className="flex-row items-center">
              <View className="p-2 bg-[#ffcc00] rounded-xl mr-3">
                <Ionicons name="star" size={18} color="#245bb5" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">QS Stars</Text>
                <Text className="text-blue-200 text-[10px]">4 Sao Quốc Tế</Text>
              </View>
            </View>
            <View className="h-8 w-[1px] bg-white/20" />
            <View className="flex-row items-center">
              <View className="p-2 bg-[#ffcc00] rounded-xl mr-3">
                <Ionicons name="trending-up" size={18} color="#245bb5" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">#355</Text>
                <Text className="text-blue-200 text-[10px]">BXH Châu Á</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- LIVE EVENTS (Horizontal Scroll) --- */}
        <View className="mt-8 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-[#1a3a6b] text-xl font-bold">Đang diễn ra</Text>
              <View className="bg-red-500 px-2 py-0.5 rounded-md ml-2">
                <Text className="text-white text-[8px] font-bold animate-pulse">LIVE</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-600 text-xs font-bold">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#245bb5" className="my-10" />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {featuredEvents.map((event) => (
                <TouchableOpacity 
                  key={event.id}
                  activeOpacity={0.9}
                  className="bg-white mr-4 rounded-[30px] border border-slate-100 shadow-sm p-3 flex-row items-center"
                  style={{ width: width * 0.8 }}
                >
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/150' }} // Thay bằng event.imageUrl
                    className="w-16 h-16 rounded-2xl bg-slate-200"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-blue-600 text-[10px] font-bold uppercase mb-1">
                      {event.eventDate} • E4
                    </Text>
                    <Text className="text-slate-800 font-bold text-sm mb-1" numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={12} color="#64748b" />
                      <Text className="text-slate-400 text-[10px] ml-1">{event.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* --- TOTAL PARTICIPANTS FLOATING TAG (Optional UI) --- */}
        <View className="mx-6 mt-6 bg-green-50 p-4 rounded-2xl flex-row items-center border border-green-100">
          <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3 shadow-sm">
            <Ionicons name="people" size={20} color="white" />
          </View>
          <View>
            <Text className="text-slate-800 font-bold text-lg leading-tight">{totalParticipants}+</Text>
            <Text className="text-slate-500 text-[10px] uppercase font-bold">Sinh viên tham gia</Text>
          </View>
        </View>

        {/* --- MAIN FEED --- */}
        <View className="mt-8 px-2">
          <View className="px-4 mb-4">
            <Text className="text-[#1a3a6b] text-xl font-bold">Bảng tin sự kiện</Text>
          </View>
          <EventFeed />
        </View>
        
        {/* Padding bottom để không bị che bởi Bottom Tabs */}
        <View className="h-20" />
      </ScrollView>
    </Layout>
  );
};

export default HomeScreen;