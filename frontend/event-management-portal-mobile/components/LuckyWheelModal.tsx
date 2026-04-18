import { luckyDrawService } from "@/services/luckydraw";
import { DrawResultResponse, LuckyDraw, Prize } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.85;
const RADIUS = WHEEL_SIZE / 2;

const defaultColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#FF8B94",
  "#C7CEEA",
  "#95E1D3",
  "#F38181",
  "#B8E994",
  "#F8C291",
];

export default function LuckyDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Đây là luckyDrawId
  const router = useRouter();

  const [luckyDrawData, setLuckyDrawData] = useState<LuckyDraw | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  // 1. Load âm thanh
  useEffect(() => {
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/tick.mp3"), // Đảm bảo bạn có file này
        );
        soundRef.current = sound;
      } catch (e) {
        console.log("Không tìm thấy file âm thanh tick.mp3");
      }
    }
    loadSound();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // 2. Fetch dữ liệu vòng quay từ Backend
  useEffect(() => {
    if (id) {
      luckyDrawService
        .getByEventId(id)
        .then((data) => setLuckyDrawData(data))
        .catch((err) => console.error("Lỗi fetch vòng quay:", err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const startDraw = async () => {
    if (spinning || !id) return;

    setSpinning(true);
    setWinner(null);
    spinAnim.setValue(0);

    try {
      // Gọi API bốc thăm thực tế
      const result: DrawResultResponse = await luckyDrawService.spin(id);

      // Tính toán góc quay (quay ít nhất 5 vòng + góc đến giải thưởng)
      // Trong ví dụ này ta quay ngẫu nhiên vì Backend đã chọn winner,
      // nhưng để chuyên nghiệp ta giả lập vòng quay dừng ở vị trí đẹp.
      Animated.timing(spinAnim, {
        toValue: 360 * 5 + Math.random() * 360,
        duration: 4000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setWinner(result.message);
        setSpinning(false);
      });
    } catch (error: any) {
      setSpinning(false);
      const msg = error.response?.data?.message || "Lỗi khi quay thưởng";
      alert(msg);
    }
  };

  const renderWheel = () => {
    if (!luckyDrawData?.prizes?.length) return null;
    const prizes = luckyDrawData.prizes;
    const angleBySegment = 360 / prizes.length;

    return (
      <Svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
      >
        <G rotation={-90} origin={`${RADIUS}, ${RADIUS}`}>
          {prizes.map((prize: Prize, index: number) => {
            const startAngle = index * angleBySegment;
            const endAngle = (index + 1) * angleBySegment;
            const x1 = RADIUS + RADIUS * Math.cos((Math.PI * startAngle) / 180);
            const y1 = RADIUS + RADIUS * Math.sin((Math.PI * startAngle) / 180);
            const x2 = RADIUS + RADIUS * Math.cos((Math.PI * endAngle) / 180);
            const y2 = RADIUS + RADIUS * Math.sin((Math.PI * endAngle) / 180);

            const pathData = `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} Z`;

            return (
              <G key={index}>
                <Path
                  d={pathData}
                  fill={defaultColors[index % defaultColors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <G
                  rotation={startAngle + angleBySegment / 2}
                  origin={`${RADIUS}, ${RADIUS}`}
                >
                  <SvgText
                    x={RADIUS + RADIUS * 0.65}
                    y={RADIUS}
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={90}
                    origin={`${RADIUS + RADIUS * 0.65}, ${RADIUS}`}
                  >
                    {prize.name.length > 15
                      ? prize.name.substring(0, 12) + "..."
                      : prize.name}
                  </SvgText>
                </G>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a6b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{luckyDrawData?.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.wheelWrapper}>
          <View style={styles.pointer} />
          <Animated.View
            style={{
              transform: [
                {
                  rotate: spinAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <View style={styles.wheelBorder}>{renderWheel()}</View>
          </Animated.View>
        </View>

        <View style={styles.resultArea}>
          {winner ? (
            <>
              <Text style={styles.congratText}>🎉 KẾT QUẢ:</Text>
              <View style={styles.winnerCard}>
                <Text style={styles.winnerName}>{winner}</Text>
              </View>
              <ConfettiCannon count={150} origin={{ x: width / 2, y: 0 }} />
            </>
          ) : (
            <Text style={styles.hintText}>
              {spinning ? "Đang quay thưởng..." : "Nhấn nút để bắt đầu"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.spinBtn, spinning && { backgroundColor: "#cbd5e1" }]}
          onPress={startDraw}
          disabled={spinning}
        >
          <Text style={styles.spinBtnText}>
            {spinning ? "..." : "QUAY NGAY"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
  },
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pointer: {
    position: "absolute",
    top: -20,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ef4444",
  },
  wheelBorder: {
    borderWidth: 8,
    borderColor: "#1e293b",
    borderRadius: WHEEL_SIZE / 2 + 8,
    elevation: 10,
    backgroundColor: "#fff",
  },
  resultArea: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  congratText: {
    color: "#f59e0b",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 8,
  },
  winnerCard: {
    backgroundColor: "#1a3a6b",
    padding: 15,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
  },
  winnerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  hintText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  spinBtn: {
    backgroundColor: "#1a3a6b",
    width: "100%",
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  spinBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
});
