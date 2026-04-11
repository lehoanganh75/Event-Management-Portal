import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logo_iuh = require("../assets/images/logo_iuh.png");

const Footer = () => {
  const router = useRouter();

  const openMap = (address: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://www.google.com/maps/search/?api=1&query=${address}`,
    });
    Linking.openURL(url);
  };

  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
  };

  const BranchInfo = ({
    title,
    address,
    phone,
  }: {
    title: string;
    address: string;
    phone: string;
  }) => (
    <View style={styles.branchContainer}>
      <Text style={styles.branchTitle}>{title}</Text>
      <Text style={styles.branchText}>
        {address} - ĐT: {phone}
      </Text>
      <TouchableOpacity
        onPress={() => openMap(address)}
        style={styles.mapButton}
      >
        <Ionicons name="map-outline" size={12} color="#ffcc00" />
        <Text style={styles.mapButtonText}>Xem bản đồ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Logo & Tên trường */}
      <View style={styles.header}>
        <Image source={logo_iuh} style={styles.logo} contentFit="contain" />
        <Text style={styles.universityName}>
          Đại học Công nghiệp TP. Hồ Chí Minh
        </Text>
      </View>

      {/* Thông tin liên hệ chính */}
      <View style={styles.contactSection}>
        <TouchableOpacity
          onPress={() => openMap("12 Nguyễn Văn Bảo, Gò Vấp, HCM")}
          style={styles.contactItem}
        >
          <Ionicons name="location" size={18} color="#ffcc00" />
          <Text style={styles.contactText}>
            Số 12 Nguyễn Văn Bảo, P.4, Q. Gò Vấp, TP. Hồ Chí Minh
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => callNumber("02838940390")}
          style={styles.contactItem}
        >
          <Ionicons name="call" size={18} color="#ffcc00" />
          <Text style={styles.contactText}>
            0283 8940 390 (Tuyển sinh: 028 3985 1932)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:dhcn@iuh.edu.vn")}
          style={styles.contactItem}
        >
          <Ionicons name="mail" size={18} color="#ffcc00" />
          <Text style={styles.contactText}>dhcn@iuh.edu.vn</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Các cơ sở và phân hiệu</Text>

      {/* Danh sách các cơ sở */}
      <BranchInfo
        title="Cơ sở Nguyễn Văn Dung"
        address="Số 10 Nguyễn Văn Dung, P.6, Gò Vấp, TP.HCM"
        phone="0283.8940 390"
      />
      <BranchInfo
        title="Cơ sở Phạm Văn Chiêu"
        address="Số 20 Đường số 53, P.14, Gò Vấp, TP.HCM"
        phone="0283.8940 390"
      />
      <BranchInfo
        title="Phân hiệu Quảng Ngãi"
        address="938 Quang Trung, P. Chánh Lộ, TP. Quảng Ngãi"
        phone="0255.625.0075"
      />
      <BranchInfo
        title="Cơ sở Thanh Hóa"
        address="Xã Quảng Phú, TP. Thanh Hóa, Tỉnh Thanh Hóa"
        phone="0237.3675.092"
      />

      {/* Copyright */}
      <Text style={styles.copyright}>
        © 2026 Đại học Công nghiệp TP.HCM - IUH{"\n"}
        Event Management Portal Mobile
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#245bb5",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    height: 48,
    width: 160,
    marginBottom: 16,
    tintColor: "#ffffff", // Thay thế cho brightness-0 invert để logo trắng hoàn toàn
  },
  universityName: {
    color: "#ffcc00",
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    fontSize: 14,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contactText: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
  },
  sectionHeader: {
    color: "#ffffff",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    paddingBottom: 8,
  },
  branchContainer: {
    marginBottom: 24,
    borderLeftWidth: 2,
    borderLeftColor: "#ffcc00",
    paddingLeft: 12,
  },
  branchTitle: {
    color: "#ffcc00",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 4,
  },
  branchText: {
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  mapButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#ffffff",
    fontSize: 10,
    marginLeft: 4,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 24,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 10,
    marginTop: 4,
  },
  statValue: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  copyright: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    fontSize: 10,
    marginTop: 32,
  },
});

export default Footer;
