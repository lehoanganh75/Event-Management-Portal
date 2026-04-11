import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

const FilterModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Background Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Ngăn sự kiện nhấn vào Modal truyền ra ngoài làm đóng Modal */}
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            {/* Thanh kéo nhỏ phía trên cùng */}
            <View style={styles.dragHandle} />

            <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            >
              {/* Nhóm lọc: Trạng thái */}
              <Text style={styles.filterLabel}>Trạng thái</Text>
              <View style={styles.filterOptionsContainer}>
                {["Tất cả", "Sắp tới", "Đang diễn ra", "Kết thúc"].map((t) => (
                  <TouchableOpacity key={t} style={styles.optionButton}>
                    <Text style={styles.optionText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bạn có thể thêm các nhóm lọc khác ở đây (Khoa, Địa điểm...) */}
              <Text style={styles.filterLabel}>Khoa / Viện</Text>
              <View style={styles.filterOptionsContainer}>
                {["CNTT", "Cơ khí", "Điện", "Kinh tế"].map((t) => (
                  <TouchableOpacity key={t} style={styles.optionButton}>
                    <Text style={styles.optionText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Nút Áp dụng */}
            <TouchableOpacity onPress={onClose} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: 34, // Padding cho iPhone có tai thỏ
    paddingTop: 12,
    height: height * 0.7, // Chiều cao 70% màn hình
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Shadow cho Android
    elevation: 20,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    borderRadius: 99,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  filterOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  optionText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  applyButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FilterModal;
