import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { verifyOTP } from '../../services/api/auth'
import { storeToken } from "../utils/storage";
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get("window");

export default function OTPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [autoFilling, setAutoFilling] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-fill simulation
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setAutoFilling(true);
  //     const demoOtp = ["1", "2", "3", "4", "5", "6"];
  //     demoOtp.forEach((d, i) => {
  //       setTimeout(() => {
  //         setOtp((prev) => {
  //           const n = [...prev];
  //           n[i] = d;
  //           return n;
  //         });
  //       }, i * 120);
  //     });
  //     setTimeout(() => setAutoFilling(false), 800);
  //   }, 2000);
  //   return () => clearTimeout(timeout);
  // }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length < 6) return;

    setLoading(true);

    console.log("phone::", phone);
    console.log("otp::", otpCode);

    try {
      const res = await verifyOTP(phone, otpCode, "user");
      console.log("otp verify res::", res);
      const token = res.token
      storeToken(token)
      SecureStore.setItemAsync("userData",JSON.stringify(res?.user));
      router.replace("/profile-setup");
    } catch (err) {
      console.error("OTP verification failed:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.join("").length === 6;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        {/* Half Screen Image - Same as Login */}
        <ImageBackground
          source={require("../../assets/images/loginbg1.jpg")}
          style={{
            height: height * 0.45,
            width: "100%",
          }}
          resizeMode="cover"
        >
          <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
          }}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Half Screen OTP Form */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            marginTop: -30,
            paddingHorizontal: 28,
            paddingTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            Verify OTP
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Enter the 6-digit code sent to
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#17381B",
              marginBottom: 24,
            }}
          >
            {phone || "+91 98765 43210"}
          </Text>

          {/* Auto-fill badge */}
          {autoFilling && (
            <View
              style={{
                backgroundColor: "#E8F5E9",
                borderRadius: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text
                style={{
                  color: "#17381B",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                Auto-reading OTP from SMS...
              </Text>
            </View>
          )}

          {/* OTP Inputs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
              gap: 8,
            }}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 60,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: digit
                    ? "#17381B"
                    : index === otp.findIndex((d) => !d)
                      ? "#2ECC71"
                      : "#E5E7EB",
                  backgroundColor: digit ? "#E8F5E9" : "#F5F7FA",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  ref={(r) => (inputRefs.current[index] = r)}
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#17381B",
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(t) => handleChange(t, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              </View>
            ))}
          </View>

          {/* Verify Button - Rounded */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!isComplete || loading}
          >
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 16,
                backgroundColor: isComplete ? "#17381B" : "#9CA3AF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 2,
                borderColor: isComplete ? "#2ECC71" : "#9CA3AF",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Resend */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <RefreshCw size={15} color="#6B7280" />
            {timer > 0 ? (
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Resend OTP in{" "}
                <Text style={{ fontWeight: "700", color: "#17381B" }}>
                  0:{timer.toString().padStart(2, "0")}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#2ECC71",
                  }}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wrong number */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Wrong number?{" "}
              <Text style={{ color: "#17381B", fontWeight: "700" }}>
                Change
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}