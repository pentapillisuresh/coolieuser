import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Info,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BookingFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [date, setDate] = useState("2026-06-28");
  const [time, setTime] = useState("10:00 AM");
  const [address, setAddress] = useState("123 Luxury Ave, Modern City");
  const [notes, setNotes] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft color="#111827" size={20} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "700",
            color: "#111827",
            marginRight: 40,
          }}
        >
          Booking Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Select Date & Time
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Calendar size={20} color="#4F46E5" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                  marginTop: 8,
                }}
              >
                {date}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Clock size={20} color="#4F46E5" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                  marginTop: 8,
                }}
              >
                {time}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Service Address
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <MapPin size={20} color="#4F46E5" />
            <Text
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 14,
                color: "#111827",
                fontWeight: "500",
              }}
            >
              {address}
            </Text>
            <ChevronLeft
              size={20}
              color="#9CA3AF"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Any Specific Instructions?
          </Text>
          <TextInput
            placeholder="e.g. Please bring extra vacuum..."
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              padding: 16,
              height: 100,
              textAlignVertical: "top",
              fontSize: 14,
            }}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            backgroundColor: "#EEF2FF",
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Info size={20} color="#4F46E5" />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#4F46E5" }}
              >
                Emergency Service
              </Text>
              <Text style={{ fontSize: 12, color: "#6366F1" }}>
                Extra $10 charge applies
              </Text>
            </View>
          </View>
          <Switch
            value={isEmergency}
            onValueChange={setIsEmergency}
            trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
            thumbColor={"#fff"}
          />
        </View>
      </ScrollView>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/booking/confirm")}
          activeOpacity={0.8}
          style={{ height: 56, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Proceed to Checkout
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
