import { View, Text, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { WORKERS } from "../../data/dummy";

export default function CompletedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker = WORKERS[0];

  const handleConfirm = () => {
    router.push({ pathname: "/booking/payment", params });
  };

  const handleRaiseIssue = () => {
    Alert.alert(
      "Raise an Issue",
      "Our support team will contact you within 2 hours.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: () => router.push("/support") },
      ],
    );
  };

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
          Work Completed!
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          {params.serviceName || "Fan Installation"}
        </Text>
      </View>

      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        {/* Completion banner */}
        <View
          style={{
            backgroundColor: "#DCFCE7",
            borderRadius: 22,
            padding: 24,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: "#86EFAC",
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "#16A34A",
            }}
          >
            <Icon2 name="check-circle" size={50} color="#16A34A" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: "#166534",
              textAlign: "center",
            }}
          >
            Work Completed! 🎉
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#15803d",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            {worker.name} has marked the job as complete. Please confirm if
            you're satisfied.
          </Text>
        </View>

        {/* Worker summary */}
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
              style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}
            >
              {worker.name}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              {params.serviceName || "Fan Installation"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#16A34A",
                marginTop: 3,
                fontWeight: "600",
              }}
            >
              ✅ Job Completed
            </Text>
          </View>
        </View>

        {/* Action info */}
        <View
          style={{ 
            backgroundColor: "#E8F5E9", 
            borderRadius: 16, 
            padding: 16,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="info" size={16} color="#17381B" />
            <Text style={{ fontSize: 14, color: "#17381B", lineHeight: 22, flex: 1 }}>
              Please verify that all work has been completed to your
              satisfaction before confirming.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ gap: 12, marginTop: "auto" }}>
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
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
              <Icon2 name="check-circle" size={20} color="#FFFFFF" />
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}
              >
                Confirm Completion
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRaiseIssue}
            style={{
              borderRadius: 50,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 2,
              borderColor: "#DC2626",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Icon3 name="exclamation-triangle" size={20} color="#DC2626" />
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: "#DC2626" }}
            >
              Raise an Issue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}