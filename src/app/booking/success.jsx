import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";

const BOOKING_ID = "KL" + Math.random().toString().slice(2, 8).toUpperCase();

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { serviceName, amount, workerName, date, time } = params;
  const [status, setStatus] = useState("waiting"); // waiting | accepted
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Simulate worker accepting
    const t = setTimeout(() => setStatus("accepted"), 5000);
    return () => {
      clearTimeout(t);
      pulse.stop();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
          paddingTop: insets.top,
          backgroundColor: "#F3F8EF",
        }}
      >
        {/* Success Icon */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], marginBottom: 28 }}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: "#DCFCE7",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 12,
                borderWidth: 3,
                borderColor: "#16A34A",
              }}
            >
              <Icon2 name="check-circle" size={70} color="#16A34A" />
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ alignItems: "center", opacity: fadeAnim }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#1F2937",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Booking Confirmed! 🎉
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Your booking has been confirmed. {"\n"}
            {status === "waiting"
              ? "Waiting for worker to accept..."
              : `${workerName || "Your worker"} has accepted the booking!`}
          </Text>

          {/* Status pill */}
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: status === "accepted" ? "#DCFCE7" : "#E8F5E9",
              borderRadius: 20,
              paddingHorizontal: 18,
              paddingVertical: 10,
            }}
          >
            {status === "waiting" ? (
              <>
                <Icon name="clock" size={16} color="#17381B" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#17381B",
                  }}
                >
                  Waiting for Worker Acceptance
                </Text>
              </>
            ) : (
              <>
                <Icon2 name="check-circle" size={16} color="#16A34A" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#16A34A",
                  }}
                >
                  Worker Accepted ✓
                </Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Booking Card */}
        <Animated.View
          style={{ opacity: fadeAnim, width: "100%", marginTop: 32 }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E8F5E9",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: "#9CA3AF",
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              BOOKING RECEIPT
            </Text>
            {[
              { label: "Booking ID", value: "#KL" + "2024005" },
              { label: "Service", value: serviceName || "Fan Installation" },
              {
                label: "Date & Time",
                value: `${date || "Today"} • ${time || "10 AM"}`,
              },
              {
                label: "Amount Paid",
                value: `₹${amount || "380"}`,
                highlight: true,
              },
            ].map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 9,
                  borderBottomWidth: i < 3 ? 1 : 0,
                  borderBottomColor: "#F3F8EF",
                }}
              >
                <Text style={{ fontSize: 13, color: "#6B7280" }}>
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: item.highlight ? "#17381B" : "#1F2937",
                  }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/booking/invoice",
                  params: { bookingId: "KL2024005", amount: amount || "380" },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 14,
              }}
            >
              <Icon name="download" size={16} color="#17381B" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#17381B",
                }}
              >
                Download Invoice
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Actions - No Gradient */}
        <Animated.View
          style={{ opacity: fadeAnim, width: "100%", gap: 12, marginTop: 24 }}
        >
          {status === "accepted" ? (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/booking/accepted", params })
              }
              activeOpacity={0.85}
            >
              <View
                style={{
                  borderRadius: 50,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: "#17381B",
                  shadowColor: "#17381B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}
                >
                  Track Booking
                </Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/bookings")}
              activeOpacity={0.85}
            >
              <View
                style={{
                  borderRadius: 50,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: "#17381B",
                  shadowColor: "#17381B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}
                >
                  View My Bookings
                </Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            style={{
              borderRadius: 50,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 2,
              borderColor: "#17381B",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Icon name="home" size={18} color="#17381B" />
            <Text
              style={{ fontSize: 15, fontWeight: "700", color: "#17381B" }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: insets.bottom + 16 }} />
      </View>
    </View>
  );
}