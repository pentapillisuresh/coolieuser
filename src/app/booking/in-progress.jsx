import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { WORKERS } from "../../data/dummy";

export default function InProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker = WORKERS[0];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header - No Gradient */}
      <View
        style={{
          backgroundColor: "#17381B",
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          Work In Progress
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          {params.serviceName || "Fan Installation"}
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        {/* Timer */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#E8F5E9",
              borderWidth: 4,
              borderColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon2 name="timer" size={28} color="#17381B" />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#17381B",
                marginTop: 4,
              }}
            >
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
            Work In Progress
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              backgroundColor: "#DCFCE7",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#16A34A",
              }}
            />
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: "#16A34A" }}
            >
              Active
            </Text>
          </View>
        </View>

        {/* Worker */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              backgroundColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 26, color: "#FFFFFF" }}>
              {worker.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}
            >
              {worker.name}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              Working on your {params.serviceName || "service"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => Alert.alert("Chat", "Opening chat...")}
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon name="message-square" size={20} color="#17381B" />
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: "#17381B" }}
            >
              Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert("Support", "Connecting to support...")}
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon name="phone" size={20} color="#2ECC71" />
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: "#2ECC71" }}
            >
              Support
            </Text>
          </TouchableOpacity>
        </View>

        {/* Safety tips */}
        <View
          style={{ 
            backgroundColor: "#E8F5E9", 
            borderRadius: 16, 
            padding: 16,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon3 name="shield-alt" size={16} color="#17381B" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#17381B",
              }}
            >
              Safety Tips
            </Text>
          </View>
          {[
            "Do not make extra cash payments",
            "Keep the booking ID handy",
            "Rate your experience after work",
          ].map((tip, i) => (
            <Text
              key={i}
              style={{ fontSize: 13, color: "#374151", lineHeight: 22 }}
            >
              • {tip}
            </Text>
          ))}
        </View>

        {/* Complete */}
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/booking/completed", params })
          }
          activeOpacity={0.85}
           style={{ marginTop: 16 }}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: "#16A34A",
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              Mark as Completed
            </Text>
            <Icon name="chevron-right" size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}