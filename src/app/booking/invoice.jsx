import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { WORKERS, getPriceBreakdown } from "../../data/dummy";

export default function InvoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    bookingId,
    amount,
    serviceName,
    categoryName,
    date,
    time,
    address,
    workerName,
  } = params;
  const baseAmount = parseInt(amount) || 380;
  const breakdown = getPriceBreakdown(Math.round(baseAmount / 1.22));
  const worker = WORKERS.find((w) => w.name === workerName) || WORKERS[0];

  const handleDownload = () =>
    Alert.alert("Download", "Invoice downloaded to your device!");
  const handleShare = () =>
    Alert.alert("Share", "Invoice sharing options will appear here");

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
            marginBottom: 4,
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
              fontSize: 22,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            Invoice
          </Text>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="share-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* Invoice card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Header - No Gradient */}
          <View
            style={{
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#17381B",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  letterSpacing: 3,
                }}
              >
                KOOLI
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: 1,
                }}
              >
                SERVICE INVOICE
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                Invoice #
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}
              >
                {bookingId || "KL2024001"}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 16,
              backgroundColor: "#DCFCE7",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Icon2 name="check-circle" size={20} color="#16A34A" />
            <Text
              style={{ fontSize: 15, fontWeight: "800", color: "#16A34A" }}
            >
              Payment Successful
            </Text>
          </View>

          <View style={{ padding: 20 }}>
            {/* Details table */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "#9CA3AF",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                SERVICE DETAILS
              </Text>
              {[
                { label: "Service", value: serviceName || "Fan Installation" },
                { label: "Category", value: categoryName || "Electrician" },
                { label: "Worker", value: worker.name },
                { label: "Date", value: date || "Jun 27, 2024" },
                { label: "Time", value: time || "3:00 PM" },
                {
                  label: "Location",
                  value: address || "42, MG Road, Hyderabad",
                },
              ].map((item, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F8EF",
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#1F2937",
                      flex: 1,
                      textAlign: "right",
                      marginLeft: 10,
                    }}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Price breakdown */}
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "#9CA3AF",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                PRICE BREAKDOWN
              </Text>
              {[
                { label: "Worker Charges", value: `₹${breakdown.base}` },
                {
                  label: "Platform Fee (5%)",
                  value: `₹${breakdown.platform_fee}`,
                },
                { label: "GST (18%)", value: `₹${breakdown.gst}` },
                {
                  label: "Discount (KOOLI50)",
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
                  marginTop: 14,
                  paddingTop: 14,
                  borderTopWidth: 2,
                  borderTopColor: "#17381B",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: "#1F2937",
                  }}
                >
                  Total Paid
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "#17381B",
                  }}
                >
                  ₹{amount || breakdown.total}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              backgroundColor: "#F3F8EF",
              padding: 16,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              Thank you for using KOOLI! 🙏{"\n"}
              For queries: support@kooli.app
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={handleDownload}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon name="download" size={18} color="#17381B" />
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: "#17381B" }}
            >
              Download
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#FFFFFF",
              borderRadius: 50,
              paddingVertical: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#E8F5E9",
            }}
          >
            <Icon name="share-2" size={18} color="#2ECC71" />
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: "#2ECC71" }}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rate now - No Gradient */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/booking/rating", params })}
          activeOpacity={0.85}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F59E0B",
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#92400E" }}>
              ⭐ Rate Your Experience
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={{ alignItems: "center", paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}