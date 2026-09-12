import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import RazorpayCheckout from "react-native-razorpay";

import {
  createRazorpayOrder,
  verifyPayment,
} from "../../../services/api/payment";

import { getBookingById } from "../../../services/api/booking";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return "Today";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "10:00 AM";

  const [hours, minutes] = timeString.split(":");

  let hour = parseInt(hours, 10);
  const minute = minutes;

  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour -= 12;
  }

  return `${hour}:${minute} ${period}`;
};

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function BookingConfirmScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const { bookingId } = params;

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // ───────────────────────────────────────────
  // Fetch booking details
  // ───────────────────────────────────────────

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setIsFetching(false);
      Alert.alert("Error", "Booking ID is missing.");
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id) => {
    try {
      setIsFetching(true);

      const response = await getBookingById(Number(id));

      console.log("📦 Booking API Response:", response.data);

      if (!response?.success) {
        throw new Error("Unable to fetch booking details.");
      }

      // API response:
      // {
      //   success: true,
      //   data: {
      //      id: 7,
      //      Service: {...},
      //      User: {...},
      //      ...
      //   }
      // }

      setBooking(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch booking:", error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Could not load booking details."
      );
    } finally {
      setIsFetching(false);
    }
  };

  // ───────────────────────────────────────────
  // Extract booking data
  // ───────────────────────────────────────────

  const service = booking?.Service;
  const category = service?.Category;
  const user = booking?.User;

  const serviceName =
    service?.name ||
    booking?.details?.serviceName ||
    "Service";

  const categoryName =
    category?.name ||
    booking?.details?.categoryName ||
    "Service Category";

  const servicePrice = Number(service?.basePrice || 0);

  const totalAmount = Number(booking?.totalAmount || 0);

  const promotionId = booking?.details?.promotionId;

  const discount = Math.max(servicePrice - totalAmount, 0);

  // Since the backend response gives us the final total,
  // we should NOT calculate the total again on the frontend.
  const breakdown = {
    base: servicePrice,
    platform_fee: 0,
    gst: 0,
    discount,
    total: totalAmount,
  };

  // ───────────────────────────────────────────
  // Handle Razorpay payment
  // ───────────────────────────────────────────

  const handleConfirm = async () => {
    if (!booking?.id) {
      Alert.alert("Error", "Booking ID is missing");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("🔵 Creating Razorpay order...");
  
      const orderResponse = await createRazorpayOrder(
        Number(booking.id)
      );
  
      console.log(
        "🟢 Razorpay Order:",
        orderResponse.data
      );
  
      const {
        orderId,
        amount,
        currency,
        key,
      } = orderResponse.data;
  
      if (!orderId) {
        throw new Error("Razorpay order ID is missing");
      }
  
      if (!amount) {
        throw new Error("Razorpay amount is missing");
      }
  
      if (!key) {
        throw new Error("Razorpay key is missing");
      }
  
      const options = {
        key: key,
        amount: Number(amount),
        currency: currency || "INR",
        name: "COOLI",
        description: `${serviceName} - Booking #${booking.id}`,
  
        order_id: orderId,
  
        prefill: {
          name: user?.name || "Customer",
          contact: user?.mobile || "",
          email: user?.email || "",
        },
  
        theme: {
          color: "#17381B",
        },
      };
  
      console.log(
        "🟡 Opening Razorpay:",
        JSON.stringify(options, null, 2)
      );
  
      const paymentData =
        await RazorpayCheckout.open(options);
  
      console.log(
        "🟢 Razorpay Payment Success:",
        paymentData
      );
  
      await verifyPayment(Number(booking.id), {
        razorpay_order_id:
          paymentData.razorpay_order_id,
  
        razorpay_payment_id:
          paymentData.razorpay_payment_id,
  
        razorpay_signature:
          paymentData.razorpay_signature,
      });
  
      router.push({
        pathname: "/booking/success",
        params: {
          bookingId: String(booking.id),
          orderId:orderId,
          serviceName,
          amount: String(Number(amount) / 100),
          date:booking.scheduledDate,
          time:booking.scheduledTime
        },
      });
  
    } catch (error) {
      console.error(
        "🔴 Razorpay Error:",
        error
      );
  
      console.error(
        "🔴 Error code:",
        error?.code
      );
  
      console.error(
        "🔴 Error description:",
        error?.description
      );
  
      Alert.alert(
        "Payment Failed",
        error?.description ||
          error?.message ||
          "Unable to open Razorpay Checkout."
      );
      router.push({
        pathname: "/booking/success",
        params: {
          bookingId: String(booking.id),serviceName,
          amount: String(Number(amount) / 100),
        },
      });
    
    } finally {
      setLoading(false);
    }
  };
  
  // ───────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────

  if (isFetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F8EF",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#17381B"
        />

        <Text
          style={{
            marginTop: 12,
            color: "#6B7280",
          }}
        >
          Loading booking details...
        </Text>
      </View>
    );
  }

  // ───────────────────────────────────────────
  // Booking not found
  // ───────────────────────────────────────────

  if (!booking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F8EF",
          padding: 20,
        }}
      >
        <Icon
          name="alert-circle"
          size={50}
          color="#DC2626"
        />

        <Text
          style={{
            marginTop: 12,
            fontSize: 18,
            fontWeight: "700",
            color: "#1F2937",
          }}
        >
          Booking not found
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#17381B",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 30,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ───────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3F8EF",
      }}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

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
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="arrow-left"
              size={20}
              color="#FFFFFF"
            />
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
        contentContainerStyle={{
          padding: 16,
          gap: 14,
          paddingBottom: 24,
        }}
      >
        {/* Worker Allocation */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon2
              name="people-outline"
              size={24}
              color="#17381B"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 2,
              }}
            >
              Worker will be allocated after successful payment
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                lineHeight: 16,
              }}
            >
              A verified professional will be assigned to your booking within minutes.
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
            shadowOffset: {
              width: 0,
              height: 2,
            },
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
            {/* Service */}
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
                  backgroundColor: "#E8F5E9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  📋
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  {serviceName}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  {categoryName}
                </Text>
              </View>
            </View>

            {/* Address */}
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
              <Icon
                name="map-pin"
                size={16}
                color="#DC2626"
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#1F2937",
                  flex: 1,
                }}
              >
                {booking.address ||
                  "Address not provided"}
              </Text>
            </View>

            {/* Date */}
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
              <Icon
                name="calendar"
                size={16}
                color="#2563EB"
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#1F2937",
                  flex: 1,
                }}
              >
                {formatDate(
                  booking.scheduledDate
                )}
              </Text>
            </View>

            {/* Time */}
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
              <Icon
                name="clock"
                size={16}
                color="#16A34A"
              />

              <Text
                style={{
                  fontSize: 14,
                  color: "#1F2937",
                  flex: 1,
                }}
              >
                {formatTime(
                  booking.scheduledTime
                )}
              </Text>
            </View>

            {/* Booking ID */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 4,
                paddingTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                Booking ID
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#17381B",
                }}
              >
                #{booking.id}
              </Text>
            </View>
          </View>
        </View>

        {/* Price Summary */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
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

          {/* Service Charge */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              Service Charge
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#1F2937",
              }}
            >
              ₹{breakdown.base.toFixed(2)}
            </Text>
          </View>

          {/* Promotion */}
          {promotionId && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                Promotion
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#16A34A",
                }}
              >
                Applied
              </Text>
            </View>
          )}

          {/* Discount */}
          {discount > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                }}
              >
                Discount
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#16A34A",
                }}
              >
                -₹{discount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Total */}
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
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: "#1F2937",
              }}
            >
              Total
            </Text>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#17381B",
              }}
            >
              ₹{breakdown.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Booking Status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#FFF7ED",
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: "#FED7AA",
          }}
        >
          <Icon
            name="info"
            size={20}
            color="#EA580C"
          />

          <Text
            style={{
              fontSize: 13,
              color: "#9A3412",
              flex: 1,
              lineHeight: 20,
            }}
          >
            Your booking is currently pending payment.
            Complete the payment to confirm your booking.
          </Text>
        </View>

        {/* Secure Payment */}
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
          <Icon3
            name="shield-alt"
            size={20}
            color="#17381B"
          />

          <Text
            style={{
              fontSize: 13,
              color: "#17381B",
              flex: 1,
              lineHeight: 20,
            }}
          >
            100% secure payment. Your data is protected with 256-bit SSL encryption.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
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
              backgroundColor: loading
                ? "#9CA3AF"
                : "#17381B",
              shadowColor: "#17381B",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#FFFFFF",
              }}
            >
              {loading
                ? "Processing Payment..."
                : `Pay ₹${breakdown.total.toFixed(
                    2
                  )} & Confirm`}
            </Text>

            {!loading && (
              <Icon
                name="chevron-right"
                size={20}
                color="#FFFFFF"
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              "rgba(255,255,255,0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size="large"
            color="#17381B"
          />

          <Text
            style={{
              marginTop: 12,
              color: "#1F2937",
              fontWeight: "600",
            }}
          >
            Processing payment...
          </Text>
        </View>
      )}
    </View>
  );
}
