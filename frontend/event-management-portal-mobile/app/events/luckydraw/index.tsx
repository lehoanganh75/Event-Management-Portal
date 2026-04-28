import { useAuth } from "@/contexts/AuthContext";
import { luckyDrawService } from "@/services/luckydraw";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.85;
const RADIUS = WHEEL_SIZE / 2;
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#FF8B94",
  "#C7CEEA",
  "#95E1D3",
];

export default function LuckyDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // eventId
  const router = useRouter();
  const { user } = useAuth();
  const isFocused = useIsFocused(); // Hook kiểm tra nếu màn hình đang được hiển thị

  const [data, setData] = useState<any>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const spinAnim = useRef(new Animated.Value(0)).current;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { text: "CHƯA KÍCH HOẠT", color: "#f59e0b" };
      case "ACTIVE":
        return { text: "ĐANG HOẠT ĐỘNG", color: "#10b981" };
      default:
        return { text: status, color: "#94a3b8" };
    }
  };

  // Tự động load lại dữ liệu khi quay lại từ trang Update
  useEffect(() => {
    if (id && isFocused) fetchData();
  }, [id, isFocused]);

  const fetchData = async () => {
    try {
      const res = await luckyDrawService.getByEventId(id);
      if (res) {
        setData(res);
        const entry = await luckyDrawService.getEntry(res.id);
        setUserEntry(entry);
      }
    } catch (err: any) {
      console.log("Không tìm thấy vòng quay cho sự kiện này");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      await luckyDrawService.activate(data.id);
      Alert.alert("Thành công", "Đã kích hoạt vòng quay!");
      fetchData();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kích hoạt.");
    }
  };

  const handleSpin = async () => {
    if (spinning || !data || data.status !== "ACTIVE") return;
    setSpinning(true);
    setWinner(null);
    spinAnim.setValue(0);

    try {
      const result = await luckyDrawService.spin(data.id);
      Animated.timing(spinAnim, {
        toValue: 360 * 5 + Math.random() * 360,
        duration: 4000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setWinner(result.message);
        setSpinning(false);
        fetchData();
      });
    } catch (err: any) {
      setSpinning(false);
      Alert.alert("Thông báo", err.response?.data?.message || "Lỗi khi quay.");
    }
  };

  const renderWheel = () => {
    const prizes = data?.prizes || [];
    if (prizes.length === 0)
      return <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 10} fill="#f1f5f9" />;

    if (prizes.length === 1) {
      return (
        <G>
          <Circle
            cx={RADIUS}
            cy={RADIUS}
            r={RADIUS}
            fill={COLORS[0]}
            stroke="#fff"
            strokeWidth="2"
          />
          <SvgText
            x={RADIUS}
            y={RADIUS}
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {prizes[0].name}
          </SvgText>
        </G>
      );
    }

    const angle = 360 / prizes.length;
    return (
      <G rotation={-90} origin={`${RADIUS}, ${RADIUS}`}>
        {prizes.map((p: any, i: number) => {
          const startAngle = i * angle;
          const endAngle = (i + 1) * angle;
          const x1 = RADIUS + RADIUS * Math.cos((Math.PI * startAngle) / 180);
          const y1 = RADIUS + RADIUS * Math.sin((Math.PI * startAngle) / 180);
          const x2 = RADIUS + RADIUS * Math.cos((Math.PI * endAngle) / 180);
          const y2 = RADIUS + RADIUS * Math.sin((Math.PI * endAngle) / 180);
          return (
            <G key={i}>
              <Path
                d={`M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} Z`}
                fill={COLORS[i % COLORS.length]}
                stroke="#fff"
                strokeWidth="2"
              />
              <G
                rotation={startAngle + angle / 2}
                origin={`${RADIUS}, ${RADIUS}`}
              >
                <SvgText
                  x={RADIUS + RADIUS * 0.6}
                  y={RADIUS}
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  rotation={90}
                  origin={`${RADIUS + RADIUS * 0.6}, ${RADIUS}`}
                >
                  {p.name.length > 12
                    ? p.name.substring(0, 10) + "..."
                    : p.name}
                </SvgText>
              </G>
            </G>
          );
        })}
      </G>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a6b" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vòng quay may mắn</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.content, { justifyContent: "center" }]}>
          <Ionicons name="gift-outline" size={80} color="#cbd5e1" />
          <Text style={styles.noDataText}>Chưa có vòng quay nào</Text>
          <Text style={styles.noDataSub}>
            Ban tổ chức chưa thiết lập vòng quay cho sự kiện này.
          </Text>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusDisplay(data.status);
  const isCreator = user?.id === data.createdByAccountId;

  const renderActionButton = () => {
    if (data.status === "PENDING") {
      return isCreator ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#10b981" }]}
          onPress={handleActivate}
        >
          <Text style={styles.btnText}>KÍCH HOẠT VÒNG QUAY</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.btn, { backgroundColor: "#cbd5e1" }]}>
          <Text style={styles.btnText}>CHỜ QUẢN TRỊ VIÊN MỞ...</Text>
        </View>
      );
    }

    if (!isCreator) {
      if (!userEntry || userEntry.status === "INVALID") {
        return (
          <View style={[styles.btn, { backgroundColor: "#ef4444" }]}>
            <Text style={styles.btnText}>KHÔNG ĐỦ ĐIỀU KIỆN</Text>
          </View>
        );
      }
      if (userEntry.status === "USED") {
        return (
          <View style={[styles.btn, { backgroundColor: "#94a3b8" }]}>
            <Text style={styles.btnText}>BẠN ĐÃ SỬ DỤNG LƯỢT</Text>
          </View>
        );
      }
    }

    return (
      <TouchableOpacity
        style={[styles.btn, spinning && { backgroundColor: "#cbd5e1" }]}
        onPress={handleSpin}
        disabled={spinning}
      >
        <Text style={styles.btnText}>
          {spinning ? "ĐANG QUAY..." : "QUAY NGAY"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {data.title}
        </Text>

        {/* NÚT SETTINGS CHO NGƯỜI TẠO */}
        {isCreator && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/events/luckydraw/update",
                params: { id: data.id },
              })
            }
            style={styles.editBtn}
          >
            <Ionicons name="settings-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
        )}
        {!isCreator && <View style={{ width: 40 }} />}
      </View>

      <View style={styles.content}>
        <View style={styles.wheelBox}>
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
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              {renderWheel()}
            </Svg>
          </Animated.View>
          <View style={styles.pointer} />
        </View>

        {winner && (
          <ConfettiCannon count={150} origin={{ x: width / 2, y: -20 }} />
        )}

        <View style={styles.resultArea}>
          {winner ? (
            <View style={styles.winnerCard}>
              <Text style={styles.winnerName}>🎉 {winner}</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Trạng thái:</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: statusInfo.color + "20" },
                ]}
              >
                <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ width: "100%", gap: 12 }}>
          {renderActionButton()}

          {/* NÚT CHỈNH SỬA PHỤ DÀNH CHO ADMIN */}
          {isCreator && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/events/luckydraw/update",
                  params: { id: data.id },
                })
              }
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>CẬP NHẬT GIẢI THƯỞNG</Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: { padding: 8, backgroundColor: "#f8fafc", borderRadius: 12 },
  editBtn: { padding: 8, backgroundColor: "#f8fafc", borderRadius: 12 },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  wheelBox: {
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
  resultArea: {
    marginVertical: 30,
    alignItems: "center",
    height: 100,
    justifyContent: "center",
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    marginRight: 8,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  winnerCard: {
    backgroundColor: "#fef3c7",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  winnerName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#b45309",
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#1a3a6b",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 1 },
  secondaryBtn: {
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
  noDataText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 20,
  },
  noDataSub: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 40,
  },
});
