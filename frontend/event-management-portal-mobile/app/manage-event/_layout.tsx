// app/manage-event/_layout.tsx
import { Stack } from "expo-router";

export default function ManageEventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
        animation: "slide_from_bottom",
      }}
    >
      {/* Trang chính quản lý sự kiện: manage-event/[id].tsx */}
      <Stack.Screen
        name="[id]"
        options={{
          title: "Quản lý sự kiện",
          presentation: "card",
        }}
      />

      {/* Danh sách người tham gia */}
      <Stack.Screen
        name="participants/[id]"
        options={{
          title: "Danh sách tham gia",
          presentation: "card",
        }}
      />

      {/* Quét QR Code */}
      <Stack.Screen
        name="scanner/[id]"
        options={{
          title: "Quét mã QR",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />

      {/* Ticket */}
      <Stack.Screen
        name="ticket/[id]"
        options={{
          title: "Vé tham gia",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
