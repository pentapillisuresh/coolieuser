import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import RazorpayCheckout from "react-native-razorpay";

import { createRazorpayOrder, verifyPayment } from "../../../services/api/payment";
import { useCart } from "../../context/CartContext";

const GREEN = "#17381B";
const GST_RATE = 0.18;

// ─── Helpers ─────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "Today";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "10:00 AM";
  const [hours, minutes] = timeString.split(":");
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minutes} ${period}`;
};

// ─── Screen ──────────────────────────────────────────────────────
export default function BookingConfirmScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Coupon data passed from the summary screen (if any)
  const paramDiscount = Number(params.discountAmount || 0);
  const paramPromotionId = params.promotionId ? Number(params.promotionId) : null;

  const {
    items = [],
    cart,
    loading: cartLoading,
    checkout,
  } = useCart();

  const [paying, setPaying] = useState(false);
  const [notes, setNotes] = useState(cart?.notes || "");
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeAlert = useCallback((title, msg) => {
    if (!mountedRef.current) return;
    Alert.alert(title, msg);
  }, []);

  // ── Totals ─────────────────────────────────────────────────
  const subtotal = items.reduce(
    (s, it) => s + (parseFloat(it.lineTotal) || 0),
    0,
  );
  const discount = Math.max(0, paramDiscount);
  const taxable = Math.max(0, subtotal - discount);
  const gst = +(taxable * GST_RATE).toFixed(2);
  const convenience = Number(cart?.convenienceCharges || 0);
  const total = +(taxable + gst + convenience).toFixed(2);

  // ── Pay + Confirm ──────────────────────────────────────────
  const handlePayAndConfirm = async () => {
    if (!items.length) {
      safeAlert("Empty cart", "Add a service before paying.");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      // 1. Convert cart → bookings on the server
      const checkoutResult = await checkout({
        promotionId: paramPromotionId || undefined,
        discountAmount: discount || undefined,
        notes: notes || undefined,
      });

      const createdBookings = checkoutResult?.bookings || [];

      if (!createdBookings.length) {
        throw new Error("No bookings were created. Please try again.");
      }

      const cartId = checkoutResult?.cartId;
      if (!cartId) throw new Error("Cart ID missing from checkout response");

      const primaryBooking = createdBookings[0];

      // 2. Create a Razorpay order for the primary booking
      //    (backend sums all bookings in the cart into one order)
      const orderResponse = await createRazorpayOrder(Number(cartId));
      const { orderId, amount, currency, key } = orderResponse.data;

      if (!orderId) throw new Error("Razorpay order ID missing");
      if (!amount)  throw new Error("Razorpay amount missing");
      if (!key)     throw new Error("Razorpay key missing");

      // 3. Open Razorpay Checkout
      const options = {
        key,
        amount: Number(amount),
        currency: currency || "INR",
        name: "COOLI",
        description:
          createdBookings.length > 1
            ? `${items.length} services · Booking #${primaryBooking.id}+`
            : `${items[0]?.details?.serviceName || "Service"} · Booking #${primaryBooking.id}`,
        order_id: orderId,
        prefill: {
          name: checkoutResult?.user?.name || "Customer",
          contact: checkoutResult?.user?.mobile || "",
          email: checkoutResult?.user?.email || "",
        },
        theme: { color: GREEN },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // 4. Verify signature on the backend
      await verifyPayment(Number(cartId), {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      // 5. Success → go to the confirmation screen
      if (!mountedRef.current) return;
      router.replace({
        pathname: "/booking/success",
        params: {
          bookingId: String(primaryBooking.id),
          allBookingIds: JSON.stringify(createdBookings.map((b) => b.id)),
          orderId,
          serviceName: items[0]?.details?.serviceName || "Service",
          amount: String(Number(amount) / 100),
          date: items[0]?.scheduledDate || primaryBooking.scheduledDate,
          time: items[0]?.scheduledTime || primaryBooking.scheduledTime,
        },
      });
    } catch (err) {
      const description =
        err?.description ||
        err?.response?.data?.error ||
        err?.message ||
        "Payment could not be completed.";

      console.error("🔴 Payment error:", err);

      // User cancelled — silent return
      if (err?.code === 0 || err?.code === "PAYMENT_CANCELLED") {
        if (mountedRef.current) setPaying(false);
        return;
      }

      if (mountedRef.current) {
        setError(description);
        // Delay the alert so the Razorpay activity has fully detached
        setTimeout(() => {
          if (mountedRef.current) safeAlert("Payment Failed", description);
        }, 250);
      }
    } finally {
      if (mountedRef.current) setPaying(false);
    }
  };

  // ── Initial loading ────────────────────────────────────────
  if (cartLoading && items.length === 0 && !paying) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading cart...</Text>
      </View>
    );
  }

  // ── Empty cart (unless we're mid-payment) ──────────────────
  if (!items.length && !paying) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF", padding: 20 }}>
        <Icon name="shopping-cart" size={50} color="#DC2626" />
        <Text style={{ marginTop: 12, fontSize: 18, fontWeight: "700", color: "#1F2937" }}>
          Your cart is empty
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            marginTop: 20, backgroundColor: GREEN,
            paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "700" }}>Browse Services</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── UI ─────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View
        style={{
          backgroundColor: GREEN,
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={paying}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFF" }}>
              Confirm & Pay
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {items.length} {items.length === 1 ? "service" : "services"} · ₹{total.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* Worker allocation note */}
        <View
          style={{
            backgroundColor: "#FFF", borderRadius: 18, padding: 14,
            flexDirection: "row", alignItems: "center", gap: 12,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          }}
        >
          <View
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: "#E8F5E9",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon2 name="people-outline" size={22} color={GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937", marginBottom: 2 }}>
              Workers will be assigned after payment
            </Text>
            <Text style={{ fontSize: 11, color: "#6B7280", lineHeight: 15 }}>
              Verified professionals reach you at the scheduled slots.
            </Text>
          </View>
        </View>

        {/* ── Cart items ──────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "#FFF", borderRadius: 20, padding: 16,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          }}
        >
          <Text style={sectionLabel}>
            YOUR SERVICES ({items.length})
          </Text>

          <View style={{ gap: 12 }}>
            {items.map((item, idx) => {
              const name =
                item?.details?.serviceName || item?.Service?.name || "Service";
              const category =
                item?.details?.categoryName || item?.Service?.Category?.name || "Category";
              const unitPrice = parseFloat(item.unitPrice) || 0;
              const lineTotal = parseFloat(item.lineTotal) || 0;
              const qty = item.quantity || 1;
              const address = item.address || "Address not set";

              return (
                <View
                  key={item.id}
                  style={{
                    borderWidth: 1, borderColor: "#E5E7EB",
                    borderRadius: 14, padding: 12,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  {/* Top row */}
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        backgroundColor: "#E8F5E9",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>
                        {idx === 0 ? "📋" : idx === 1 ? "🛠️" : "🧰"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#1F2937" }} numberOfLines={2}>
                        {name}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        {category}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 10, color: "#9CA3AF" }}>Line total</Text>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: GREEN }}>
                        ₹{lineTotal.toFixed(0)}
                      </Text>
                    </View>
                  </View>

                  {/* Meta rows */}
                  <View style={{ gap: 6, marginTop: 10 }}>
                    <MetaRow
                      icon="map-pin"
                      color="#DC2626"
                      text={address}
                      numberOfLines={2}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <MetaRow
                          icon="calendar"
                          color="#2563EB"
                          text={formatDate(item.scheduledDate)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <MetaRow
                          icon="clock"
                          color="#16A34A"
                          text={formatTime(item.scheduledTime)}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Quantity + unit price */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: "#F3F4F6",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      Qty <Text style={{ fontWeight: "800", color: "#1F2937" }}>{qty}</Text>
                      {"  ·  "}
                      ₹{unitPrice.toFixed(0)} each
                    </Text>
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      Item #{idx + 1}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Special Instructions ──────────────────────── */}
        <View
          style={{
            backgroundColor: "#FFF", borderRadius: 18, padding: 16,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
            Special Instructions
          </Text>
          <TextInput
            style={{
              backgroundColor: "#F3F8EF",
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              color: "#1F2937",
              borderWidth: 1.5,
              borderColor: notes ? GREEN : "#E5E7EB",
              minHeight: 70,
              textAlignVertical: "top",
            }}
            placeholder="Any notes for the workers..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={notes}
            onChangeText={setNotes}
            editable={!paying}
          />
        </View>

        {/* ── Price summary ─────────────────────────────── */}
        <View
          style={{
            backgroundColor: "#FFF", borderRadius: 20, padding: 16,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          }}
        >
          <Text style={sectionLabel}>PRICE SUMMARY</Text>

          <Row label={`Subtotal (${items.length} items)`} value={`₹${subtotal.toFixed(2)}`} />
          <Row label={`GST (${(GST_RATE * 100).toFixed(0)}%)`} value={`₹${gst.toFixed(2)}`} />
          {convenience > 0 && (
            <Row label="Convenience Fee" value={`₹${convenience.toFixed(2)}`} />
          )}
          {discount > 0 && (
            <Row label="Discount Applied" value={`-₹${discount.toFixed(2)}`} accent />
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
              borderTopWidth: 2,
              borderTopColor: GREEN,
              paddingTop: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>Total</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: GREEN }}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* ── Error banner ──────────────────────────────── */}
        {error && (
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: "#FEE2E2", borderRadius: 14, padding: 12,
              borderWidth: 1, borderColor: "#FCA5A5",
            }}
          >
            <Icon name="alert-circle" size={18} color="#DC2626" />
            <Text style={{ flex: 1, fontSize: 12, color: "#991B1B" }}>
              {error}
            </Text>
          </View>
        )}

        {/* ── Payment status note ───────────────────────── */}
        <View
          style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: "#FFF7ED", borderRadius: 14, padding: 14,
            borderWidth: 1, borderColor: "#FED7AA",
          }}
        >
          <Icon name="info" size={20} color="#EA580C" />
          <Text style={{ fontSize: 12, color: "#9A3412", flex: 1, lineHeight: 18 }}>
            Booking is created only after payment succeeds. If payment is cancelled,
            your cart stays intact.
          </Text>
        </View>

        {/* ── Secure payment ────────────────────────────── */}
        <View
          style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: "#E8F5E9", borderRadius: 14, padding: 14,
            borderWidth: 1, borderColor: GREEN,
          }}
        >
          <Icon3 name="shield-alt" size={20} color={GREEN} />
          <Text style={{ fontSize: 12, color: GREEN, flex: 1, lineHeight: 18 }}>
            100% secure payment. Your data is protected with 256-bit SSL encryption.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 16,
          paddingTop: 12,
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F8EF",
        }}
      >
        <TouchableOpacity
          onPress={handlePayAndConfirm}
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
              backgroundColor: paying ? "#9CA3AF" : GREEN,
              shadowColor: GREEN,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {paying ? (
              <>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFF" }}>
                  Processing Payment...
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFF" }}>
                  Pay ₹{total.toFixed(0)} & Confirm
                </Text>
                <Icon name="chevron-right" size={20} color="#FFF" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Loading overlay (only while Razorpay is opening) ── */}
      {paying && (
        <View
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(255,255,255,0.75)",
            justifyContent: "center", alignItems: "center",
          }}
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={{ marginTop: 12, color: "#1F2937", fontWeight: "600" }}>
            Please complete the payment
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Small helpers ───────────────────────────────────────────────
const sectionLabel = {
  fontSize: 12,
  fontWeight: "800",
  color: "#9CA3AF",
  letterSpacing: 1,
  marginBottom: 12,
};

function MetaRow({ icon, color, text, numberOfLines = 1 }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F3F8EF",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Icon name={icon} size={13} color={color} />
      <Text
        style={{ fontSize: 12, color: "#1F2937", flex: 1, fontWeight: "600" }}
        numberOfLines={numberOfLines}
      >
        {text}
      </Text>
    </View>
  );
}

function Row({ label, value, accent }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 14, color: "#6B7280" }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: accent ? "#16A34A" : "#1F2937",
        }}
      >
        {value}
      </Text>
    </View>
  );
}