import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // Thường dùng slide_from_right cho cảm giác chuyển trang tự nhiên
      }}
    >
      {/* 1. Chi tiết sự kiện: events/[id].tsx */}
      <Stack.Screen name="[id]" />

      {/* 2. Chỉnh sửa sự kiện: events/edit.tsx */}
      <Stack.Screen name="edit" />

      {/* 3. Màn hình Vòng quay chính: events/luckydraw/luckydraw.tsx */}
      {/* Lưu ý: name phải khớp với đường dẫn thư mục/tên file */}
      <Stack.Screen
        name="luckydraw/index"
        options={{
          animation: "slide_from_right",
        }}
      />

      {/* 4. Màn hình Tạo vòng quay: events/luckydraw/create.tsx */}
      <Stack.Screen
        name="luckydraw/create"
        options={{
          animation: "slide_from_bottom", // Tạo mới thường dùng hiệu ứng trượt lên từ dưới
        }}
      />

      <Stack.Screen
        name="luckydraw/update"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
