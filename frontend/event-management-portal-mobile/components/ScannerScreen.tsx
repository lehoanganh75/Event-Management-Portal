import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen({ event }: { event: any }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Cần cấp quyền camera để quét mã</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={{ color: "#fff" }}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onScan = ({ data }: any) => {
    setScanned(true);
    Alert.alert("Điểm danh", `Xác nhận vé: ${data}`, [
      { text: "Quét tiếp", onPress: () => setScanned(false) },
      { text: "Đóng", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : onScan}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.text}>Đưa mã QR vào khung để điểm danh</Text>
        <Text style={styles.subText}>{event.title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  btn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 20,
  },
  text: { color: "#fff", marginTop: 20, fontWeight: "bold" },
  subText: { color: "#cbd5e1", fontSize: 12, marginTop: 5 },
});
