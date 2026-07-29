import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { COLORS, WORKERS } from "../../data/dummy";

const BOOKING_STEPS = [
  { id: 1, label: "Booking Confirmed", done: true },
  { id: 2, label: "Worker Accepted", done: true },
  { id: 3, label: "Worker On Way", done: false, active: true },
  { id: 4, label: "Work Started", done: false },
  { id: 5, label: "Completed", done: false },
];

export default function AcceptedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker = WORKERS[0];
  const { serviceName, date, time, address, bookingId } = params;

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
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
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            Booking #{bookingId || "KL2024001"}
          </Text>
        </View>
        {/* Live status badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(46,204,113,0.2)",
            borderRadius: 12,
            padding: 10,
            alignSelf: "flex-start",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#2ECC71",
            }}
          />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
            Worker On The Way
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* Worker Card */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: "#17381B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 32, color: "#FFFFFF" }}>
                  {worker.name.charAt(0)}
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#16A34A",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              >
                <Icon2 name="verified" size={11} color="#FFFFFF" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}
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
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {worker.rating}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  · {worker.experience} experience
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#16A34A",
                  marginTop: 3,
                  fontWeight: "600",
                }}
              >
                📍 Arriving in ~15 mins
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Calling", `Dialing ${worker.name}...`)
              }
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#DCFCE7",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon name="phone" size={18} color="#16A34A" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: "#16A34A",
                }}
              >
                Call
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert("Chat", "Opening chat...")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#E8F5E9",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon name="message-square" size={18} color="#17381B" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: "#17381B",
                }}
              >
                Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#EDE9FE",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon3 name="map-marked-alt" size={18} color="#7C3AED" />
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: "#7C3AED" }}
              >
                Track
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Steps */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            Booking Progress
          </Text>
          {BOOKING_STEPS.map((step, i) => (
            <View
              key={step.id}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: i < BOOKING_STEPS.length - 1 ? 0 : 0,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: step.done
                      ? "#16A34A"
                      : step.active
                        ? "#17381B"
                        : "#F3F8EF",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: step.active ? 2 : 0,
                    borderColor: step.active
                      ? "#2ECC71"
                      : "transparent",
                  }}
                >
                  {step.done ? (
                    <Icon name="check" size={16} color="#FFFFFF" />
                  ) : step.active ? (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#D1D5DB",
                      }}
                    />
                  )}
                </View>
                {i < BOOKING_STEPS.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: 28,
                      backgroundColor: step.done ? "#16A34A" : "#E5E7EB",
                      marginTop: 2,
                      marginBottom: 2,
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  paddingTop: 6,
                  flex: 1,
                  paddingBottom: i < BOOKING_STEPS.length - 1 ? 16 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: step.active || step.done ? "700" : "500",
                    color: step.done
                      ? "#1F2937"
                      : step.active
                        ? "#17381B"
                        : "#9CA3AF",
                  }}
                >
                  {step.label}
                </Text>
                {step.active && (
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                  >
                    In progress...
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Booking Details */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            gap: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            Booking Details
          </Text>
          {[
            {
              icon: "map-pin",
              text: address || "42, MG Road, Hyderabad",
              color: "#DC2626",
            },
            { icon: "calendar", text: date || "Today", color: "#2563EB" },
            { icon: "clock", text: time || "3:00 PM", color: "#16A34A" },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#F3F8EF",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Icon name={item.icon} size={16} color={item.color} />
              <Text style={{ fontSize: 14, color: "#1F2937" }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Worker Arrived Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/booking/arrived", params })}
          activeOpacity={0.85}
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
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
              Worker Arrived? →
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}