import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, Share, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { getBookingById } from "../../../services/api/booking";

// ─── Helper for price breakdown ──────────────────────────────────

export default function InvoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingId = params.bookingId?.toString() || "";
  const amountParam = parseFloat(params.amount?.toString() || "0");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await getBookingById(Number(bookingId));
      setBooking(response.data);
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      Alert.alert("Error", "Could not load invoice data.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Share invoice ──────────────────────────────────────────────
  const handleShare = async () => {
    if (!booking) return;
    try {
      const {
        id,
        address,
        scheduledDate,
        scheduledTime,
        totalAmount,
        paymentStatus,
        specialInstructions,
        Service,
        User,
      } = booking;

      const serviceName = Service?.name || "Service";
      const categoryName = Service?.Category?.name || "Category";
      const userName = User?.name || "Customer";
      const userPhone = User?.mobile || "N/A";
      const amount = parseFloat(totalAmount) || 0;
      const discount = 0;

      const invoiceText = `
========================================
              COOLI INVOICE
========================================
Invoice #: ${id || "N/A"}
Date: ${new Date().toLocaleDateString()}
Status: ${paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}

--- Service Details ---
Service: ${serviceName}
Category: ${categoryName}
Date: ${scheduledDate || "N/A"}
Time: ${scheduledTime || "N/A"}
Address: ${address || "N/A"}
Special Instructions: ${specialInstructions || "None"}

--- Customer ---
Name: ${userName}
Phone: ${userPhone}

--- Price Breakdown ---
Base Charge: ₹${booking.servicePrice}
Platform Fee (5%): ₹${booking.convenianceCharges}
GST (18%): ₹${booking.GST}
Discount: -₹${booking.discountAmount}
----------------------------------------
Total Paid: ₹${booking.totalAmount}
========================================

Thank you for choosing COOLI!
For queries, contact: support@COOLI.app
      `;

      const result = await Share.share({
        message: invoiceText,
        title: `Invoice #${id}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share invoice.");
      console.error("Share error:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading invoice...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
          No invoice data found.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Extract booking details ──────────────────────────────────
  const {
    id: bookingIdNum,
    address,
    scheduledDate,
    scheduledTime,
    totalAmount,
    paymentStatus,
    specialInstructions,
    Service,
    User,
  } = booking;

  const serviceName = Service?.name || "Service";
  const categoryName = Service?.Category?.name || "Category";
  const userName = User?.name || "Customer";
  const userPhone = User?.mobile || "N/A";
  const amount = parseFloat(totalAmount) || 0;
  const discount = 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
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
          {/* Header */}
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
                COOLI
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
                {bookingIdNum || "N/A"}
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
              backgroundColor: paymentStatus === "paid" ? "#DCFCE7" : "#FEF3C7",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Icon2
              name={paymentStatus === "paid" ? "check-circle" : "info"}
              size={20}
              color={paymentStatus === "paid" ? "#16A34A" : "#D97706"}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: paymentStatus === "paid" ? "#16A34A" : "#D97706",
              }}
            >
              {paymentStatus === "paid" ? "Payment Successful" : "Payment Pending"}
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
                { label: "Service", value: serviceName },
                { label: "Category", value: categoryName },
                { label: "Date", value: scheduledDate || "N/A" },
                { label: "Time", value: scheduledTime || "N/A" },
                { label: "Address", value: address || "N/A" },
                { label: "Special Instructions", value: specialInstructions || "None" },
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

            {/* Customer details */}
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
                CUSTOMER
              </Text>
              {[
                { label: "Name", value: userName },
                { label: "Phone", value: userPhone },
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
                    }}
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
                { label: "Service Charge", value: `₹${booking.servicePrice}` },
                { label: "Platform Fee (5%)", value: `₹${booking.convenianceCharges}` },
                { label: "GST (18%)", value: `₹${booking.GST}` },
                ...(booking.discountAmount > 0 ? [{ label: "Discount", value: `-₹${booking.discountAmount}`, green: true }] : []),
              ].map((r, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: i < (booking.discountAmount > 0 ? 3 : 2) ? 1 : 0,
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
                  ₹{booking.totalAmount}
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
              Thank you for using COOLI! 🙏{"\n"}
              For queries: support@COOLI.app
            </Text>
          </View>
        </View>

        {/* Action buttons - Only Share */}
        <View style={{ flexDirection: "row", gap: 12 }}>
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
              Share Invoice
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rate now */}
        {/* <TouchableOpacity
          onPress={() => router.push({ pathname: "/booking/rating", params: { bookingId: bookingId } })}
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
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => router.replace("../(tabs)/home")}
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