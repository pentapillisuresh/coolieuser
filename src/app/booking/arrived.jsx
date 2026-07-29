import { View, Text, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { COLORS, WORKERS } from "../../data/dummy";

export default function ArrivedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker = WORKERS[0];

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            Worker Arrived!
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Arrived animation */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            shadowColor: "#16A34A",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Icon2 name="home" size={48} color="#16A34A" />
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#1F2937",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Worker Has Arrived!
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          {worker.name} is at your location.{"\n"}Share the OTP to start the
          service.
        </Text>

        {/* Worker info */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 28, color: "#FFFFFF" }}>
              {worker.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 17, fontWeight: "900", color: "#1F2937" }}
            >
              {worker.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 3,
              }}
            >
              <Icon2 name="star" size={13} color="#F59E0B" />
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}
              >
                {worker.rating}
              </Text>
              <Icon2 name="verified" size={13} color="#16A34A" />
              <Text style={{ fontSize: 12, color: "#16A34A" }}>
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* OTP section */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 2,
            borderColor: "#17381B",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Icon2 name="qr-code" size={20} color="#17381B" />
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: "#17381B" }}
            >
              Your Service OTP
            </Text>
          </View>
          <Text
            style={{
              fontSize: 48,
              fontWeight: "900",
              color: "#17381B",
              letterSpacing: 12,
              marginBottom: 8,
            }}
          >
            4829
          </Text>
          <Text
            style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}
          >
            Share this OTP with the worker to start service. Valid for this
            session only.
          </Text>
        </View>

        {/* Verify OTP Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/booking/work-otp", params })}
          activeOpacity={0.85}
          style={{ width: "100%" }}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#17381B",
              shadowColor: "#17381B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              Verify OTP & Start Work
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}