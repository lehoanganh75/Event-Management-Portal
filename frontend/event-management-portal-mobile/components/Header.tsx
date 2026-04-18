import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router"; // Dùng useRouter của expo-router
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const roleMap: any = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản Trị Viên",
  ORGANIZER: "Ban Tổ Chức",
  MEMBER: "Thành Viên",
  EVENT_PARTICIPANT: "Người Tham Gia",
  GUEST: "Khách",
};

interface HeaderProps {
  unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ unreadCount = 0 }) => {
  const { user, logout } = useAuth(); // Lấy user và logout từ Context
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logo_iuh = require("../assets/images/logo_iuh.png");

  const getPrimaryRole = () => {
    return roleMap[user?.role || "GUEST"] || "Khách hàng";
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout(); // Gọi hàm logout của Context (đã bao gồm redirect về login)
  };

  return (
    <>
      {/* 1. Top Mini Bar - Thông tin hệ thống */}
      <View style={styles.topMiniBar}>
        <View style={styles.rowBetween}>
          <View style={styles.rowItems}>
            <View style={styles.onlineDot} />
            <Text style={styles.systemText}>IUH Event Portal</Text>
          </View>
          <View style={styles.rowItems}>
            <TouchableOpacity style={styles.miniLink}>
              <Ionicons name="help-circle-outline" size={14} color="#fff" />
            </TouchableOpacity>
            <View style={styles.rowItems}>
              <Ionicons name="globe-outline" size={14} color="#fff" />
              <Text style={styles.miniLinkText}>VN</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Main Header Bar */}
      <View style={styles.mainHeader}>
        {/* Logo Area */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          activeOpacity={0.7}
          style={styles.logoContainer}
        >
          <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
        </TouchableOpacity>

        {/* Right Side Controls */}
        <View style={styles.rightControls}>
          {/* Notifications */}
          <TouchableOpacity
            onPress={() =>
              user
                ? router.push("/notifications" as any)
                : router.push("/login")
            }
            style={styles.iconButton}
          >
            <View>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#334155"
              />
              {user && unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* User Avatar / Login Button */}
          {user ? (
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              style={styles.profileArea}
            >
              <View style={styles.avatarWrapper}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.activeIndicator} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. User Menu Bottom Sheet */}
      <Modal visible={isMenuOpen} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.menuSheet}>
            <View style={styles.dragHandle} />

            <View style={styles.userSummary}>
              <View style={styles.largeAvatar}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.largeAvatarImg}
                  />
                ) : (
                  <Text style={styles.largeAvatarText}>
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {user?.fullName}
                </Text>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={14}
                    color="#1a479a"
                  />
                  <Text style={styles.roleText}>{getPrimaryRole()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push("/(tabs)/profile");
                }}
                style={styles.menuItem}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="person-outline" size={20} color="#1a479a" />
                </View>
                <Text style={styles.menuItemText}>Thông tin cá nhân</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push("/my-events" as any);
                }}
                style={styles.menuItem}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#1a479a" />
                </View>
                <Text style={styles.menuItemText}>Lịch trình của tôi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.menuItem, { marginTop: 10 }]}
              >
                <View
                  style={[styles.menuIconBox, { backgroundColor: "#fff1f2" }]}
                >
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                </View>
                <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  topMiniBar: {
    backgroundColor: "#1a479a",
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowItems: { flexDirection: "row", alignItems: "center" },
  onlineDot: {
    width: 6,
    height: 6,
    backgroundColor: "#4ade80",
    borderRadius: 3,
    marginRight: 6,
  },
  systemText: { color: "white", fontSize: 10, fontWeight: "600", opacity: 0.9 },
  miniLink: { marginRight: 15 },
  miniLinkText: {
    color: "white",
    fontSize: 10,
    marginLeft: 4,
    fontWeight: "bold",
  },

  mainHeader: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: { flex: 1 },
  logo: { height: 32, width: 100 },
  rightControls: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: 8 },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: { color: "white", fontSize: 8, fontWeight: "bold" },

  profileArea: { marginLeft: 8 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    backgroundColor: "#1a479a",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "white", fontWeight: "bold", fontSize: 16 },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: "#22c55e",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
  },

  loginBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  loginBtnText: { color: "#1a479a", fontWeight: "bold", fontSize: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 3,
    marginBottom: 20,
  },
  userSummary: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  largeAvatar: {
    width: 60,
    height: 60,
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    overflow: "hidden",
  },
  largeAvatarImg: { width: "100%", height: "100%" },
  largeAvatarText: { color: "#1a479a", fontSize: 26, fontWeight: "900" },
  userNameText: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  roleBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  roleText: {
    color: "#64748b",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },

  menuItems: { marginTop: 15 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  menuItemText: { fontSize: 15, fontWeight: "600", color: "#334155" },
});

export default Header;
