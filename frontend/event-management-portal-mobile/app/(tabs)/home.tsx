import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import EventFeed from "@/components/EventFeed";
import Footer from "@/components/Footer";
import HomeListHeader from "@/components/HomeListHeader";
import Layout from "@/components/Layout";
import { useEventContext } from "@/contexts/EventContext";
import { Event } from "@/types/event";

export default function HomeScreen() {
  const {
    upcomingWeek,
    ongoing,
    fetchOngoing,
    fetchUpcomingWeek,
    loading: managerLoading,
  } = useEventContext();

  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(async () => {
    try {
      // Chỉ gọi 2 API cần thiết nhất
      await Promise.all([fetchOngoing(), fetchUpcomingWeek()]);
    } catch (err) {
      console.error("Lỗi tải dữ liệu Home:", err);
    }
  }, [fetchOngoing, fetchUpcomingWeek]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const formatDateToDayMonth = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? ""
      : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const mapEventsToHeader = (events?: Event[]) => {
    if (!Array.isArray(events)) return [];
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      eventDate: formatDateToDayMonth(e.startTime),
      registeredCount: e.registeredCount ?? 0,
      image: e.coverImage,
    }));
  };

  const computeTotalParticipants = (events?: Event[]) => {
    if (!Array.isArray(events)) return 0;
    // Tính tổng số người tham gia của các sự kiện đang truyền vào (ongoing)
    return events.reduce((sum, e) => sum + (e.registeredCount ?? 0), 0);
  };

  return (
    <Layout>
      <StatusBar style="light" />
      <View style={styles.container}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <HomeListHeader
              loading={managerLoading}
              ongoingEvents={mapEventsToHeader(ongoing)}
              // Hiển thị tổng số người tham gia của các sự kiện đang diễn ra
              totalParticipants={computeTotalParticipants(ongoing)}
            />
          }
          ListFooterComponent={
            <View style={styles.footerContent}>
              {/* EventFeed sẽ hiển thị danh sách sự kiện trong tuần */}
              <EventFeed events={upcomingWeek || []} />
              <Footer />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#245bb5"
              colors={["#245bb5"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  footerContent: { paddingBottom: 20 },
});
