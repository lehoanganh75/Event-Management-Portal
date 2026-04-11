import { getEventById, registerEvent } from "@/services/events";
import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (id) fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const data = await getEventById(id as string);
      if (data) setEvent(data);
    } catch (err) {
      console.error("Lỗi fetch chi tiết sự kiện:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Định dạng ngày giờ
  const formatDateTime = (iso: string) => {
    if (!iso) return "Chưa cập nhật";
    const d = new Date(iso);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN")}`;
  };

  // Helper: Kiểm tra hết hạn đăng ký
  const isDeadlinePassed = (deadline: string) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const handleMainAction = async () => {
    if (!event) return;
    const role = event.currentUserRole || {};

    // 1. Nếu là Quản lý
    if (role.creator || role.approver || role.organizer) {
      router.push(`/manage-event/${event.id}`);
      return;
    }

    // 2. Nếu đã đăng ký -> Xem vé (Truyền EVENT ID)
    if (role.registered) {
      // SỬA TẠI ĐÂY: Truyền event.id
      router.push(`/manage-event/tickets/${event.id}`);
      return;
    }

    // 3. Logic đăng ký...
    Alert.alert("Xác nhận", `Đăng ký tham gia "${event.title}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng ký",
        onPress: async () => {
          setIsRegistering(true);
          try {
            const result = await registerEvent(event.id);
            Alert.alert("Thành công", "Đăng ký thành công!", [
              {
                text: "Xem vé",
                onPress: () => router.push(`/manage-event/tickets/${event.id}`), // SỬA TẠI ĐÂY
              },
            ]);
            fetchEventData();
          } catch (error: any) {
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Đăng ký thất bại",
            );
          } finally {
            setIsRegistering(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải dữ liệu sự kiện...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#cbd5e1" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>
          Không tìm thấy sự kiện
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLinkBtn}
        >
          <Text style={styles.backLinkText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const role = event.currentUserRole || {};

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* COVER IMAGE & HERO */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: event.coverImage }}
            style={styles.coverImg}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
            style={styles.overlay}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
              <View style={styles.typeTag}>
                <Text style={styles.typeText}>{event.type}</Text>
              </View>
              <View style={[styles.typeTag, { backgroundColor: "#3b82f6" }]}>
                <Text style={[styles.typeText, { color: "#fff" }]}>
                  {event.eventTopic}
                </Text>
              </View>
            </View>
            <Text style={styles.mainTitle}>{event.title}</Text>
          </View>
        </View>

        {/* ROLE BADGES */}
        <View style={styles.badgeRow}>
          {role.creator && (
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
              ]}
            >
              <Ionicons name="star" size={12} color="#ea580c" />
              <Text style={[styles.roleText, { color: "#ea580c" }]}>
                Chủ trì
              </Text>
            </View>
          )}
          {role.registered && (
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
              <Text style={[styles.roleText, { color: "#059669" }]}>
                Đã đăng ký
              </Text>
            </View>
          )}
        </View>

        {/* THÔNG TIN CHÍNH */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={[styles.iconBox, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="calendar" size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Thời gian bắt đầu</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(event.startTime)}
              </Text>
            </View>
          </View>
          <View style={styles.hDivider} />
          <View style={styles.infoItem}>
            <View style={[styles.iconBox, { backgroundColor: "#fff1f2" }]}>
              <Ionicons name="location" size={20} color="#e11d48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Địa điểm ({event.eventMode})</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          </View>
          {event.registrationDeadline && (
            <>
              <View style={styles.hDivider} />
              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDeadlinePassed(
                        event.registrationDeadline,
                      )
                        ? "#fef2f2"
                        : "#f0fdf4",
                    },
                  ]}
                >
                  <Ionicons
                    name="hourglass"
                    size={20}
                    color={
                      isDeadlinePassed(event.registrationDeadline)
                        ? "#ef4444"
                        : "#16a34a"
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Hạn chót đăng ký</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      isDeadlinePassed(event.registrationDeadline) && {
                        color: "#ef4444",
                      },
                    ]}
                  >
                    {formatDateTime(event.registrationDeadline)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* THÔNG SỐ QUY MÔ */}
        <View style={styles.scaleContainer}>
          <View style={styles.scaleItem}>
            <Text style={styles.scaleNumber}>{event.maxParticipants}</Text>
            <Text style={styles.scaleLabel}>Quy mô</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.scaleItem}>
            <Text style={styles.scaleNumber}>{event.registeredCount}</Text>
            <Text style={styles.scaleLabel}>Đã đăng ký</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.scaleItem}>
            <Text style={[styles.scaleNumber, { color: "#2563eb" }]}>
              {event.maxParticipants - event.registeredCount}
            </Text>
            <Text style={styles.scaleLabel}>Còn trống</Text>
          </View>
        </View>

        {/* GIỚI THIỆU */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu sự kiện</Text>
          <Text style={styles.descText}>{event.description}</Text>
          {event.notes && (
            <View style={styles.notesBox}>
              <Ionicons name="alert-circle" size={18} color="#92400e" />
              <Text style={styles.notesText}>
                <Text style={{ fontWeight: "800" }}>Lưu ý: </Text>
                {event.notes}
              </Text>
            </View>
          )}
        </View>

        {/* DIỄN GIẢ */}
        {event.presenters && event.presenters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diễn giả khách mời</Text>
            {event.presenters.map((p) => (
              <View key={p.id} style={styles.presenterCard}>
                <Image
                  source={{ uri: p.avatarUrl }}
                  style={styles.presenterAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.presenterName}>{p.fullName}</Text>
                  <Text style={styles.presenterSub}>
                    {p.position} • {p.department}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerValue}>
            {event.registeredCount}/{event.maxParticipants}
          </Text>
          <Text style={styles.footerLabel}>Đã đăng ký tham gia</Text>
        </View>

        {/* Kiểm tra logic hiển thị nút */}
        {!role.registered &&
        !role.creator &&
        !role.approver &&
        !role.organizer &&
        isDeadlinePassed(event.registrationDeadline) ? (
          // TRƯỜNG HỢP: Quá hạn đăng ký và không phải là quản lý
          <View
            style={[
              styles.mainBtn,
              { backgroundColor: "#e2e8f0", elevation: 0 },
            ]}
          >
            <Text style={[styles.mainBtnText, { color: "#94a3b8" }]}>
              HẾT HẠN ĐĂNG KÝ
            </Text>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#94a3b8"
              style={{ marginLeft: 6 }}
            />
          </View>
        ) : (
          // TRƯỜNG HỢP CÒN LẠI: Còn hạn HOẶC đã đăng ký HOẶC là quản lý
          <TouchableOpacity
            style={[
              styles.mainBtn,
              role.creator || role.approver || role.organizer
                ? styles.btnManage
                : role.registered
                  ? styles.btnTicket
                  : styles.btnRegister,
              isRegistering && { opacity: 0.7 },
            ]}
            onPress={handleMainAction}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>
                  {role.creator || role.approver || role.organizer
                    ? "QUẢN LÝ"
                    : role.registered
                      ? "XEM VÉ"
                      : "ĐĂNG KÝ"}
                </Text>
                <Ionicons
                  name={role.registered ? "qr-code-outline" : "chevron-forward"}
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 4 }}
                />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
  },
  loadingText: { marginTop: 12, color: "#64748b", fontWeight: "600" },
  backLinkBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  backLinkText: { color: "#2563eb", fontWeight: "800" },

  heroSection: { height: 350, position: "relative" },
  coverImg: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heroContent: {
    position: "absolute",
    bottom: 30,
    paddingHorizontal: 24,
    width: "100%",
  },
  typeTag: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontWeight: "900",
    fontSize: 10,
    color: "#78350f",
    textTransform: "uppercase",
  },
  mainTitle: { color: "#fff", fontSize: 26, fontWeight: "900", lineHeight: 32 },

  badgeRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: -20,
    gap: 8,
    zIndex: 20,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#fff",
    elevation: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
    textTransform: "uppercase",
  },

  infoCard: {
    margin: 24,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "700",
    marginTop: 2,
  },
  hDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 15 },

  scaleContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  scaleItem: { flex: 1, alignItems: "center" },
  scaleNumber: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  scaleLabel: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  vDivider: { width: 1, height: 30, backgroundColor: "#f1f5f9" },

  section: { paddingHorizontal: 24, marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  descText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    textAlign: "justify",
  },
  notesBox: {
    marginTop: 15,
    flexDirection: "row",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
    gap: 8,
  },
  notesText: { flex: 1, fontSize: 13, color: "#92400e" },

  presenterCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 12,
    marginBottom: 10,
  },
  presenterAvatar: { width: 50, height: 50, borderRadius: 15 },
  presenterName: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  presenterSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 35 : 20,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    elevation: 10,
  },
  footerLeft: { flex: 1 },
  footerValue: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  footerLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  mainBtn: {
    paddingHorizontal: 28,
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  btnRegister: { backgroundColor: "#2563eb" },
  btnTicket: { backgroundColor: "#10b981" },
  btnManage: { backgroundColor: "#1e293b" },
  mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});
