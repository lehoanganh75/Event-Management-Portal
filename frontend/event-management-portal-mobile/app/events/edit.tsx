import { getEventById } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>({});

  useEffect(() => {
    if (id) {
      getEventById(id as string).then((data) => {
        setEventData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const InputField = ({
    label,
    icon,
    value,
    onChangeText,
    multiline = false,
  }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline && {
            height: 120,
            alignItems: "flex-start",
            paddingTop: 12,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#1e293b"
          style={{ marginTop: multiline ? 4 : 0 }}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          placeholder={`Nhập ${label.toLowerCase()}...`}
        />
      </View>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a3a6b" />
    );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={26} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa</Text>
        <TouchableOpacity
          onPress={() => {
            
          }}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnText}>LƯU</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
        >
          <InputField
            label="TÊN SỰ KIỆN"
            icon="bookmark-outline"
            value={eventData.title}
            onChangeText={(t: any) => setEventData({ ...eventData, title: t })}
          />
          <InputField
            label="MÔ TẢ"
            icon="document-text-outline"
            value={eventData.description}
            multiline
            onChangeText={(t: any) =>
              setEventData({ ...eventData, description: t })
            }
          />
          <InputField
            label="ĐỊA ĐIỂM"
            icon="location-outline"
            value={eventData.location}
            onChangeText={(t: any) =>
              setEventData({ ...eventData, location: t })
            }
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="GIỚI HẠN"
                icon="people-outline"
                value={String(eventData.maxParticipants)}
              />
            </View>
            <View style={{ width: 15 }} />
            <View style={{ flex: 1 }}>
              <InputField
                label="LOẠI"
                icon="options-outline"
                value={eventData.type}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  saveBtn: {
    backgroundColor: "#1a3a6b",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  form: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "600",
  },
  row: { flexDirection: "row" },
});
