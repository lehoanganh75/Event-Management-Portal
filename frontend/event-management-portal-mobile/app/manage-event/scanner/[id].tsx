import { getEventById } from "@/services/events"; // Giả định bạn có hàm checkIn
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ScannerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Lấy thông tin sự kiện
  useEffect(() => {
    if (id) {
      getEventById(id)
        .then((data) => setEvent(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // 2. Xử lý khi quét được mã QR
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);

    try {
      // Gọi API check-in với mã token quét được (data) và id sự kiện
      // const response = await checkInParticipant(id, data);

      Alert.alert("Thành công", `Đã điểm danh sinh viên thành công!`, [
        {
          text: "Tiếp tục quét",
          onPress: () => {
            setScanned(false);
            setIsProcessing(false);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Thất bại",
        error.message || "Mã không hợp lệ hoặc đã sử dụng",
        [
          {
            text: "Thử lại",
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ],
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color="#64748b" />
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền truy cập Camera để quét mã
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>CẤP QUYỀN CAMERA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Overlay Giao diện Quét */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.scanTitle}>ĐIỂM DANH QR</Text>
            <Text style={styles.scanSub} numberOfLines={1}>
              {event?.title}
            </Text>
          </View>
        </View>

        {/* Khung ngắm mã QR */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {isProcessing && (
            <View style={styles.processingBox}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.processingText}>Đang kiểm tra...</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerHint}>
            Di chuyển mã QR vào giữa khung hình
          </Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Đã điểm danh:{" "}
              <Text style={{ fontWeight: "bold" }}>
                0 / {event?.registeredCount}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Permission Styles
  permissionText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  permissionBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: { color: "#fff", fontWeight: "bold" },

  // Overlay Styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { marginLeft: 16, flex: 1 },
  scanTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  scanSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },

  // Viewfinder (Khung quét)
  viewfinder: {
    alignSelf: "center",
    width: width * 0.7,
    height: width * 0.7,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#2563eb",
    borderWidth: 5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },

  processingBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  processingText: { color: "#fff", marginTop: 10, fontWeight: "600" },

  footer: { alignItems: "center", paddingHorizontal: 40 },
  footerHint: { color: "#fff", fontSize: 14, opacity: 0.8, marginBottom: 20 },
  statsContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statsText: { color: "#fff", fontSize: 14 },
});
