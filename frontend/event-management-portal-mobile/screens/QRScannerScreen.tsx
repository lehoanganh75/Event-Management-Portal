import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const scannerSize = width * 0.7; // Kích thước khung vuông quét

const QRScannerScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // Yêu cầu quyền truy cập Camera khi vào trang
  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-10">
        <Ionicons name="camera-outline" size={80} color="#94a3b8" />
        <Text className="text-center text-slate-800 font-bold text-lg mt-6">
          Quyền truy cập Camera
        </Text>
        <Text className="text-center text-slate-500 mt-2 mb-8">
          Ứng dụng cần quyền sử dụng camera để quét mã QR điểm danh sự kiện.
        </Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-[#1a479a] px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">CẤP QUYỀN TRUY CẬP</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // Giả lập xử lý checkin
    console.log("Dữ liệu QR:", data);
    alert(`Đã quét mã: ${data}`);
    
    // Sau khi quét xong 2 giây thì cho phép quét tiếp hoặc chuyển trang
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Lớp phủ làm mờ xung quanh (Overlay) */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View className="flex-row">
            <View style={styles.unfocusedContainer}></View>
            {/* Khung quét trung tâm */}
            <View style={styles.focusedContainer}>
              {/* 4 Góc vuông bo tròn */}
              <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ffcc00] rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#ffcc00] rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#ffcc00] rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ffcc00] rounded-br-2xl" />
              
              {/* Tia quét quét chạy qua chạy lại (Animation giả lập) */}
              <View className="w-full h-0.5 bg-[#ffcc00] opacity-50 shadow-md shadow-yellow-400" />
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>

        {/* Nội dung phía trên Overlay */}
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-between items-center py-16 px-6">
          {/* Header */}
          <View className="w-full flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg">Quét QR Check-in</Text>
            <TouchableOpacity 
              onPress={() => setTorch(!torch)}
              className={`w-12 h-12 rounded-full items-center justify-center ${torch ? 'bg-[#ffcc00]' : 'bg-white/20'}`}
            >
              <Ionicons name={torch ? "flashlight" : "flashlight-outline"} size={24} color={torch ? "black" : "white"} />
            </TouchableOpacity>
          </View>

          {/* Hướng dẫn quét */}
          <View className="items-center">
            <Text className="text-white text-center font-medium opacity-80 mb-2">
              Hướng camera về phía mã QR Code
            </Text>
            <Text className="text-[#ffcc00] text-center font-bold">
              Check-in nhanh - Điểm rèn luyện liền tay
            </Text>
          </View>

          {/* Footer UI */}
          <View className="bg-black/40 px-6 py-4 rounded-3xl border border-white/10">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="qr-code" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Hệ thống sự kiện IUH</Text>
                <Text className="text-gray-300 text-[10px]">Tự động nhận diện và điểm danh</Text>
              </View>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Độ tối của phần xung quanh khung quét
  },
  unfocusedContainer: {
    flex: 1,
  },
  focusedContainer: {
    width: scannerSize,
    height: scannerSize,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Giữ phần giữa trong suốt để nhìn thấy camera
  },
});

export default QRScannerScreen;