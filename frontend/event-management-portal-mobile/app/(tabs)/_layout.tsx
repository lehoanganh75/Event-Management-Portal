// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#245bb5',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { height: 60, paddingBottom: 8 },
            headerShown: false, 
        }}
    >
        <Tabs.Screen
            name="home"
            options={{
                title: 'Trang chủ',
                tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
            }}
        />
        <Tabs.Screen
            name="qrscanner"
            options={{
                title: 'Check-in', 
                tabBarLabel: 'Quét mã', 
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons 
                        name={focused ? "qr-code" : "qr-code-outline"} 
                        size={24} 
                        color={color} 
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: 'Cá nhân',
                tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
            }}
        />
    </Tabs>
  );
}