import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import {
  WORKERS,
  CATEGORIES,
  getPriceBreakdown,
} from "../../data/dummy";

export default function BookingConfirmScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    categoryId,
    serviceName,
    servicePrice,
    date,
    time,
    address,
    workerName,
    workerCharge,
    workerId,
  } = params;
  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const worker = WORKERS.find((w) => w.id === workerId) || WORKERS[0];
  const price = parseInt(servicePrice) || 200;
  const breakdown = getPriceBreakdown(price);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [loading, setLoading] = useState(false);

  const PAYMENT_OPTS = [
    {
      id: "upi",
      label: "Google Pay (UPI)",
      detail: "arjun@okaxis",
      icon: "mobile-alt",
      color: "#4285F4",
    },
    {
      id: "card",
      label: "HDFC Credit Card",
      detail: "•••• •••• •••• 4521",
      icon: "credit-card",
      color: "#E53E3E",
    },
    {
      id: "wallet",
      label: "KOOLI Wallet",
      detail: "Balance: ₹1,250",
      icon: "wallet",
      color: "#17381B",
    },
  ];

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: "/booking/success",
        params: { ...params, amount: breakdown.total },
      });
    }, 1500);
  };

  const getPaymentIcon = (iconName) => {
    switch(iconName) {
      case 'mobile-alt': return Icon3;
      case 'credit-card': return Icon3;
      case 'wallet': return Icon3;
      default: return Icon3;
    }
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
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            Confirm Booking
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
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            YOUR WORKER
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ position: "relative" }}>
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
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {worker.rating}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  · Verified · {worker.experience} exp
                </Text>
              </View>
            </View>
            <Text
              style={{ fontSize: 16, fontWeight: "900", color: "#17381B" }}
            >
              ₹{workerCharge}/hr
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            BOOKING DETAILS
          </Text>
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#F3F8EF",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: cat.bg || "#E8F5E9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#1F2937",
                  flex: 1,
                }}
              >
                {serviceName}
              </Text>
            </View>
            {[
              {
                icon: "map-pin",
                text: address || "42, MG Road, Hyderabad",
                color: "#DC2626",
              },
              { icon: "calendar", text: date || "Today", color: "#2563EB" },
              { icon: "clock", text: time || "10:00 AM", color: "#16A34A" },
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
                <Text style={{ fontSize: 14, color: "#1F2937", flex: 1 }}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            PAYMENT METHOD
          </Text>
          {PAYMENT_OPTS.map((opt) => {
            const IconComponent = getPaymentIcon(opt.icon);
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSelectedPayment(opt.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor:
                    selectedPayment === opt.id ? "#17381B" : "#F3F8EF",
                  backgroundColor:
                    selectedPayment === opt.id ? "#E8F5E9" : "#F8FAFF",
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: opt.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent name={opt.icon} size={20} color={opt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1F2937",
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {opt.detail}
                  </Text>
                </View>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor:
                      selectedPayment === opt.id ? "#17381B" : "#D1D5DB",
                    backgroundColor:
                      selectedPayment === opt.id ? "#17381B" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedPayment === opt.id && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            PRICE SUMMARY
          </Text>
          {[
            { label: "Service Charge", value: `₹${breakdown.base}` },
            { label: "Platform Fee", value: `₹${breakdown.platform_fee}` },
            { label: "GST (18%)", value: `₹${breakdown.gst}` },
            {
              label: "Discount",
              value: `-₹${breakdown.discount}`,
              green: true,
            },
          ].map((r, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: "#F3F8EF",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                {r.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: r.green ? "#16A34A" : "#1F2937",
                }}
              >
                {r.value}
              </Text>
            </View>
          ))}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
              borderTopWidth: 2,
              borderTopColor: "#17381B",
              paddingTop: 12,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}
            >
              Total
            </Text>
            <Text
              style={{ fontSize: 22, fontWeight: "900", color: "#17381B" }}
            >
              ₹{breakdown.total}
            </Text>
          </View>
        </View>

        {/* Secure note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#E8F5E9",
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <Icon3 name="shield-alt" size={20} color="#17381B" />
          <Text
            style={{ fontSize: 13, color: "#17381B", flex: 1, lineHeight: 20 }}
          >
            100% secure payment. Your data is protected with 256-bit SSL
            encryption.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA - No Gradient */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 16,
          paddingTop: 12,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F8EF",
        }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={loading}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
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
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              {loading ? "Processing..." : `Pay ₹${breakdown.total} & Confirm`}
            </Text>
            {!loading && (
              <Icon name="chevron-right" size={20} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}