import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";

export default function WorkOTPScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    setError(false);
    if (text && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code === "4829") {
      setVerified(true);
      setTimeout(
        () => router.push({ pathname: "/booking/in-progress", params }),
        1200,
      );
    } else {
      setError(true);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const isComplete = otp.join("").length === 4;

  if (verified) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F3F8EF",
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            borderWidth: 3,
            borderColor: "#16A34A",
          }}
        >
          <Icon2 name="check-circle" size={56} color="#16A34A" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#1F2937" }}>
          OTP Verified!
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>
          Work has started 🚀
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Header - No Gradient */}
        <View
          style={{
            backgroundColor: "#17381B",
            paddingTop: insets.top + 12,
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="arrow-left" size={20} color="#FFFFFF" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#FFFFFF",
              marginBottom: 10,
            }}
          >
            Enter Work OTP
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 22,
            }}
          >
            Worker enters the 4-digit OTP you shared to start work
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            marginTop: -28,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 28,
            paddingTop: 36,
          }}
        >
          {error && (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="x-circle" size={18} color="#DC2626" />
              <Text
                style={{ fontSize: 14, color: "#DC2626", fontWeight: "600" }}
              >
                Incorrect OTP. Please try again.
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Enter the 4-digit OTP you showed the worker
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 12,
              marginBottom: 36,
            }}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  borderWidth: 2.5,
                  borderColor: error
                    ? "#DC2626"
                    : digit
                      ? "#17381B"
                      : "#E5E7EB",
                  backgroundColor: digit ? "#E8F5E9" : "#F3F8EF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  ref={(r) => (inputRefs.current[index] = r)}
                  style={{
                    fontSize: 28,
                    fontWeight: "900",
                    color: "#17381B",
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(t) => handleChange(t, index)}
                />
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: "#E8F5E9",
              borderRadius: 14,
              padding: 14,
              marginBottom: 28,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#17381B",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              💡 Hint: OTP is 4829 (demo)
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!isComplete}
          >
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isComplete ? "#17381B" : "#9CA3AF",
                shadowColor: isComplete ? "#17381B" : "#9CA3AF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}
              >
                Verify OTP & Start Work
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}