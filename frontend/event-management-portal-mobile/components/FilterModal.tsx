import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

const FilterModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-[40px] p-6 h-[70%]">
        <View className="w-12 h-1 bg-slate-200 self-center rounded-full mb-6" />
        <Text className="text-xl font-bold text-slate-800 mb-6">Bộ lọc nâng cao</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Mock filters - Bạn có thể copy logic select từ Web sang TouchableOpacity ở đây */}
          <Text className="font-bold text-slate-700 mb-2">Trạng thái</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {['Tất cả', 'Sắp tới', 'Đang diễn ra', 'Kết thúc'].map(t => (
              <TouchableOpacity key={t} className="bg-slate-100 px-4 py-2 rounded-xl">
                <Text className="text-slate-600 text-xs">{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Thêm các mục lọc khác tương tự... */}
        </ScrollView>

        <TouchableOpacity onPress={onClose} className="bg-blue-700 py-4 rounded-2xl mt-4">
          <Text className="text-white text-center font-bold">Áp dụng bộ lọc</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default FilterModal;