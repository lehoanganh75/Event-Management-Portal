import { luckyDrawService } from "@/services/luckydraw";
import { DrawResultResponse, LuckyDraw } from "@/types/event";
import React, { createContext, useCallback, useContext, useState } from "react";
import { Alert } from "react-native";

interface LuckyDrawContextType {
  currentDraw: LuckyDraw | null;
  loading: boolean;
  isSpinning: boolean;
  fetchDrawDetails: (id: string) => Promise<void>;
  activateDraw: (id: string) => Promise<void>;
  performSpin: (id: string) => Promise<DrawResultResponse | null>;
  userEntry: any;
  checkUserEntry: (id: string) => Promise<void>;
}

const LuckyDrawContext = createContext<LuckyDrawContextType | undefined>(
  undefined,
);

export const LuckyDrawProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentDraw, setCurrentDraw] = useState<LuckyDraw | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // 1. Lấy thông tin chi tiết vòng quay
  const fetchDrawDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await luckyDrawService.getById(id);
      setCurrentDraw(data);
    } catch (error) {
      console.error("Fetch Draw Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Kiểm tra lượt quay của user
  const checkUserEntry = useCallback(async (id: string) => {
    try {
      const entry = await luckyDrawService.getEntry(id);
      setUserEntry(entry);
    } catch (error) {
      setUserEntry(null);
    }
  }, []);

  // 3. Kích hoạt vòng quay (Admin)
  const activateDraw = async (id: string) => {
    try {
      await luckyDrawService.activate(id);
      await fetchDrawDetails(id); // Reload dữ liệu
      Alert.alert("Thành công", "Vòng quay đã được kích hoạt!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kích hoạt vòng quay.");
    }
  };

  // 4. Thực hiện quay thưởng
  const performSpin = async (
    id: string,
  ): Promise<DrawResultResponse | null> => {
    setIsSpinning(true);
    try {
      const result = await luckyDrawService.spin(id);
      await checkUserEntry(id); // Cập nhật lại lượt quay (đã dùng)
      return result;
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Lỗi khi thực hiện quay thưởng";
      Alert.alert("Rất tiếc", msg);
      return null;
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <LuckyDrawContext.Provider
      value={{
        currentDraw,
        loading,
        isSpinning,
        fetchDrawDetails,
        activateDraw,
        performSpin,
        userEntry,
        checkUserEntry,
      }}
    >
      {children}
    </LuckyDrawContext.Provider>
  );
};

// Hook để sử dụng context nhanh
export const useLuckyDraw = () => {
  const context = useContext(LuckyDrawContext);
  if (!context) {
    throw new Error("useLuckyDraw must be used within a LuckyDrawProvider");
  }
  return context;
};
