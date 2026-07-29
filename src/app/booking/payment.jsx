import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { PAYMENT_METHODS, getPriceBreakdown } from "../../data/dummy";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { servicePrice, serviceName } = params;
  const price = parseInt(servicePrice) || 200;
  const breakdown = getPriceBreakdown(price);
  const [selected, setSelected] = useState("pm1");
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      router.push({
        pathname: "/booking/invoice",
        params: { ...params, bookingId: "KL2024001", amount: breakdown.total },
      });
    }, 1500);
  };

  const getPaymentIcon = (iconName) => {
    switch(iconName) {
      case 'Smartphone': return 'phone';
      case 'CreditCard': return 'credit-card';
      case 'Wallet': return 'wallet';
      case 'Building2': return 'building';
      case 'Banknote': return 'money-bill';
      default: return 'credit-card';
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
            Secure Payment
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* Amount Card - No Gradient */}
        <View
          style={{ 
            borderRadius: 22, 
            padding: 24, 
            alignItems: "center",
            backgroundColor: "#17381B",
            shadowColor: "#17381B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              fontWeight: "600",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            TOTAL DUE
          </Text>
          <Text
            style={{
              fontSize: 46,
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: -1,
            }}
          >
            ₹{breakdown.total}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginTop: 4,
            }}
          >
            {serviceName || "Service"}
          </Text>
        </View>

        {/* Payment Methods */}
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
              fontSize: 16,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 14,
            }}
          >
            Choose Payment Method
          </Text>
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = selected === pm.id;
            const iconName = getPaymentIcon(pm.icon);
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelected(pm.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  padding: 14,
                  borderRadius: 16,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? "#17381B" : "#F3F8EF",
                  backgroundColor: isSelected ? "#E8F5E9" : "#F8FAFF",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: pm.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon3 name={iconName} size={22} color={pm.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1F2937",
                    }}
                  >
                    {pm.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                  >
                    {pm.detail}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? "#17381B" : "#D1D5DB",
                    backgroundColor: isSelected
                      ? "#17381B"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary */}
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
              fontSize: 14,
              fontWeight: "800",
              color: "#9CA3AF",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            PAYMENT SUMMARY
          </Text>
          {[
            { label: "Service Charge", value: `₹${breakdown.base}` },
            { label: "Platform Fee", value: `₹${breakdown.platform_fee}` },
            { label: "GST", value: `₹${breakdown.gst}` },
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
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                {r.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
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
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "900", color: "#1F2937" }}
            >
              Total
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "900", color: "#17381B" }}
            >
              ₹{breakdown.total}
            </Text>
          </View>
        </View>

        {/* Secure badge */}
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
          <Text style={{ fontSize: 13, color: "#17381B", flex: 1 }}>
            Payments secured by 256-bit SSL encryption
          </Text>
        </View>
      </ScrollView>

      {/* CTA - No Gradient */}
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
          onPress={handlePay}
          activeOpacity={0.85}
          disabled={paying}
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
              {paying ? "Processing..." : `Pay ₹${breakdown.total}`}
            </Text>
            {!paying && (
              <Icon name="chevron-right" size={20} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}