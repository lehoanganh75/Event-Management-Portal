import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const RADIUS = WHEEL_SIZE / 2;

const defaultColors = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94", "#C7CEEA",
  "#95E1D3", "#F38181", "#B8E994", "#F8C291"
];

interface Prize {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  luckDrawId: string;
}

const LuckyWheelModal: React.FC<Props> = ({ visible, onClose, luckDrawId }) => {
  const [luckyDrawData, setLuckyDrawData] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const spinAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load âm thanh tick
  useEffect(() => {
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/tick.mp3'));
      soundRef.current = sound;
    }
    loadSound();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  useEffect(() => {
    const fetchLuckyDraw = async () => {
      try {

      } catch (error) {
        console.error("Lỗi lấy dữ liệu vòng quay:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (visible && luckDrawId) fetchLuckyDraw();
  }, [visible, luckDrawId]);

  const renderWheel = () => {
    if (!luckyDrawData?.prizes?.length) return null;
    const prizes = luckyDrawData.prizes;
    const angleBySegment = 360 / prizes.length;

    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
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
                <Path d={pathData} fill={defaultColors[index % defaultColors.length]} stroke="#fff" strokeWidth="2" />
                <G rotation={startAngle + angleBySegment / 2} origin={`${RADIUS}, ${RADIUS}`}>
                  <SvgText
                    x={RADIUS + RADIUS * 0.7}
                    y={RADIUS}
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={90}
                    origin={`${RADIUS + RADIUS * 0.7}, ${RADIUS}`}
                  >
                    {prize.name.length > 12 ? prize.name.substring(0, 10) + "..." : prize.name}
                  </SvgText>
                </G>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  const spin = async () => {
    if (spinning || !luckyDrawData?.prizes) return;

    try {
      const res = await axios.post(`http://localhost:8083/api/lucky-draws/${luckDrawId}/spin`);
      const winData = res.data;
      const prizes = luckyDrawData.prizes;
      const winningIndex = prizes.findIndex((p: any) => p.id === winData.prize?.id);

      const segmentAngle = 360 / prizes.length;
      const randomOffset = segmentAngle * 0.3 + Math.random() * (segmentAngle * 0.4);
      
      // Tính toán góc xoay: 10 vòng + góc tới phần thưởng (xoay ngược chiều kim đồng hồ)
      const targetRotation = 360 * 10 + (360 - (winningIndex * segmentAngle + segmentAngle / 2));

      setSpinning(true);
      setResult(null);
      spinAnim.setValue(0);

      Animated.timing(spinAnim, {
        toValue: targetRotation,
        duration: 5000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setSpinning(false);
        setResult(winData.message);
        soundRef.current?.stopAsync();
      });

      // Phát âm thanh khi quay (giả lập)
      soundRef.current?.replayAsync();

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Hệ thống bận, thử lại sau!";
      showNotification(errorMsg, "error");
    }
  };

  const rotateInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/70 px-4">
        
        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <View className={`absolute top-12 z-50 flex-row items-center px-6 py-3 rounded-2xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <Ionicons name={toast.type === 'success' ? "checkmark-circle" : "alert-circle"} size={20} color="white" />
            <Text className="text-white font-bold ml-2">{toast.message}</Text>
          </View>
        )}

        <View className="relative w-full bg-[#2D1B69] rounded-[40px] p-6 items-center border border-white/10 overflow-hidden">
          <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View className="mb-6 items-center">
            <View className="bg-yellow-400 px-4 py-1 rounded-full mb-3">
              <Text className="text-[#2D1B69] text-[10px] font-black uppercase tracking-widest">{luckyDrawData?.title || "MINIGAME"}</Text>
            </View>
            <Text className="text-white text-3xl font-black text-center">Vòng Quay{"\n"}<Text className="text-yellow-400">May Mắn</Text></Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#facc15" />
          ) : (
            <View className="items-center justify-center relative">
              {/* Kim chỉ phần thưởng */}
              <View className="absolute top-[-15] z-30 shadow-xl">
                <View style={styles.pointer} />
              </View>

              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <View className="border-[8px] border-yellow-400 rounded-full shadow-2xl">
                  {renderWheel()}
                </View>
              </Animated.View>

              <TouchableOpacity
                onPress={spin}
                disabled={spinning}
                activeOpacity={0.8}
                className="absolute w-20 h-20 bg-yellow-400 rounded-full items-center justify-center border-4 border-[#1e1247] shadow-inner"
              >
                <Text className="text-[#2D1B69] font-black text-sm">{spinning ? "..." : "QUAY"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {result && (
            <View className="mt-8 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-4 w-full">
              <Text className="text-yellow-300 font-bold mb-1 text-center italic">🎉 Kết quả:</Text>
              <Text className="text-xl font-black text-yellow-400 uppercase text-center">{result}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    pointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#facc15',
    },
});

export default LuckyWheelModal;