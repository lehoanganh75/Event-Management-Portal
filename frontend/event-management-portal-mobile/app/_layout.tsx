// app/_layout.tsx
import { AuthProvider } from "@/contexts/AuthContext";
import { EventProvider } from "@/contexts/EventContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <EventProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade_from_bottom",
            }}
          >
            {/* Welcome Screen */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* Auth Group */}
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />

            {/* Tabs Group (Trang chủ + Profile) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Events Detail */}
            <Stack.Screen
              name="events/[id]"
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />

            {/* Manage Event Group */}
            <Stack.Screen
              name="manage-event"
              options={{
                headerShown: false,
                presentation: "modal", // Hiện dưới dạng modal
              }}
            />
          </Stack>
        </EventProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
