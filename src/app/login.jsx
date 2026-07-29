import { useState, useRef } from "react";
import {View,Text,TextInput,TouchableOpacity,KeyboardAvoidingView,Platform,ScrollView,ImageBackground,Dimensions} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, ChevronDown } from "lucide-react-native";
import {sendOTP} from '../../services/api/auth'

const { height } = Dimensions.get("window");

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);

    const res= await sendOTP(phone,'user');
    console.log("otp res:::",res)
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: "/otp", params: { phone: phone } });
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        {/* Half Screen Image - Reduced Height */}
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
          }} />
        </ImageBackground>

        {/* Half Screen Login Form */}
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
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 4,
              }}
            >
              Welcome to User
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 24,
              }}
            >
              Trusted workers. Anytime, anywhere.
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Enter Mobile Number
            </Text>

            {/* Phone input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F5F7FA",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                overflow: "hidden",
                height: 56,
                marginBottom: 16,
              }}
            >
              {/* Country code */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 14,
                  borderRightWidth: 1,
                  borderRightColor: "#E5E7EB",
                  height: "100%",
                }}
              >
                <Text style={{ fontSize: 18 }}>🇮🇳</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1F2937",
                  }}
                >
                  +91
                </Text>
                <ChevronDown size={14} color="#6B7280" />
              </TouchableOpacity>

              {/* Number input */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  gap: 8,
                }}
              >
                <Phone size={18} color="#17381B" />
                <TextInput
                  ref={inputRef}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1F2937",
                    letterSpacing: 1,
                  }}
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                  autoFocus
                />
              </View>
            </View>

            {/* Send OTP Button - Rounded */}
            <TouchableOpacity
              onPress={handleSendOTP}
              activeOpacity={0.85}
              disabled={phone.length < 10 || loading}
            >
              <View
                style={{
                  borderRadius: 50,
                  paddingVertical: 16,
                  backgroundColor: phone.length >= 10 ? "#17381B" : "#9CA3AF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: phone.length >= 10 ? "#2ECC71" : "#9CA3AF",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Terms */}
            <Text
              style={{
                textAlign: "center",
                color: "#9CA3AF",
                fontSize: 12,
                lineHeight: 18,
                marginTop: 8,
              }}
            >
              By continuing, you agree to our{" "}
              <Text style={{ color: "#17381B", fontWeight: "600" }}>
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text style={{ color: "#17381B", fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}