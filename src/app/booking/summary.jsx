import { useEffect, useState } from "react";
import {View,Text,ScrollView,TouchableOpacity,Alert,StatusBar,ActivityIndicator,TextInput} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { createBooking } from "../../../services/api/booking";
import { validateCoupon } from "../../../services/api/promotions";
import * as SecureStore from 'expo-secure-store';
import { useData } from "@shopify/react-native-skia";
import messaging from '@react-native-firebase/messaging';

// ─── Helper for price breakdown ──────────────────────────────────
const getPriceBreakdown = (base, discount = 0) => {
  const platformFee = Math.round(base * 0.05);
  const gst = Math.round((base + platformFee) * 0.18);
  const total = base + platformFee + gst - discount;
  return { base, platform_fee: platformFee, gst, discount, total };
};

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState(null)
  const [specialInstructions, setSpecialInstructions] = useState("");
  // ─── Parse payload ──────────────────────────────────────────────
  let payload = null;
  try {
    if (params.bookingPayload) {
      payload = JSON.parse(params.bookingPayload);
    }
  } catch (e) {
    console.error("Failed to parse booking payload:", e);
  }
// Function to geocode an address using Nominatim
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Coolie/1.0' // Required by Nominatim's usage policy[reference:3]
      }
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    } else {
      return null; // Address not found
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}


// Usage example:
  // ─── Fallback if payload is missing ────────────────────────────
  if (!payload) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
          No booking data found. Please go back and try again.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    categoryId,
    categoryName,
    serviceId,
    serviceName,
    servicePrice = 0,
    scheduledDate,
    scheduledTime,
    addressId,
    address,
    latitude,
    longitude,
    bookingType,
    details = {},
  } = payload;
console.log("rrr::",payload)
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promotionId, setPromotionId] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [location, setLocation] = useState({
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });
    const basePrice = Number(servicePrice) || 0;
  const breakdown = getPriceBreakdown(basePrice, appliedDiscount);

  useEffect(() => {
    const getLocation = async () => {
      if (!address || (latitude != null && longitude != null)) {
        return;
      }
  
      try {
        const result = await geocodeAddress(address);
  
        if (result) {
          setLocation({
            latitude: result.latitude,
            longitude: result.longitude,
          });
  
          console.log(
            "getLocation:::",
            result.latitude,
            result.longitude
          );
        }
      } catch (error) {
        console.error("Failed to geocode address:", error);
      }
    };
  
    getLocation();
  }, [address, latitude, longitude]);
  

  useEffect(() => {

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('New booking Notification!', remoteMessage.notification?.body);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const userDetails = await SecureStore.getItemAsync("userData");

        if (userDetails) {
          setUserData(JSON.parse(userDetails));
        }

      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, []);

  // ─── Handle coupon application ──────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    setCouponError(null);
    setCouponMessage(null);

    try {
      const response = await validateCoupon(couponCode.trim(),userData.mobile);
      console.log("coupon valide::",response.message)
      if (response?.success) {
        let discountAmount = 0;
        if (response.data.discountType === "percentage") {
          discountAmount = Math.round((basePrice * response.data.discountValue) / 100);
        } else {
          discountAmount = response.data.discountValue;
        }
        setAppliedDiscount(discountAmount);
        setPromotionId(response.data.id || null);
        setCouponMessage(response.message || "Coupon applied successfully!");
        setCouponError(null);
      } else {
        setCouponError(response?.message || "Invalid coupon code");
        setAppliedDiscount(0);
        setPromotionId(null);
        setCouponMessage(null);
      }
    } catch (error) {
      setCouponError(error.message || "Failed to verify coupon");
      setAppliedDiscount(0);
      setPromotionId(null);
      setCouponMessage(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setPromotionId(null);
    setCouponMessage(null);
    setCouponError(null);
  };
  const convertToMySQLTime = (time) => {
    if (!time) return "10:00:00";
  
    // Already MySQL TIME format
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }
  
    // Convert "10:00 AM" / "2:30 PM" → "10:00:00" / "14:30:00"
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  
    if (!match) {
      throw new Error("Invalid scheduledTime format. Use HH:mm:ss or hh:mm AM/PM");
    }
  
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
  
    if (period === "AM" && hours === 12) {
      hours = 0;
    }
  
    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
  
    return `${String(hours).padStart(2, "0")}:${minutes}:00`;
  };
  
  // ─── Handle confirm booking ────────────────────────────────────
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const bookingData = {
        serviceId: Number(serviceId),
        address: address || "Address not provided",
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: convertToMySQLTime(scheduledTime) || "10:00:00",
        specialInstructions,
        latitude,
        addressId,
        longitude,
        details: {
          ...details,
          bookingType,
          categoryName,
          serviceName,
          ...(promotionId && { promotionId }),
        },
        servicePrice:breakdown.base,
        GST:breakdown.gst,
        convenianceCharges:breakdown.platform_fee,
        discountAmount:breakdown.discount,
        totalAmount: breakdown.total,
      };
      const response = await createBooking(bookingData);
      Alert.alert("Success", "Booking created successfully!");

      router.push({
        pathname: "/booking/confirm",
        params: { bookingId: response.data.id.toString() },
      });
    } catch (error) {
      console.error("Booking creation failed:", error);
      Alert.alert("Error", error.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── UI helpers ─────────────────────────────────────────────────
  const Row = ({ label, value, bold, accent }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F8EF",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: bold ? "#1F2937" : "#6B7280",
          fontWeight: bold ? "700" : "500",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: accent ? "#16A34A" : bold ? "#1F2937" : "#374151",
          fontWeight: bold ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  );

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
            Booking Summary
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* Service Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 4,
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
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                backgroundColor: "#E8F5E9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28 }}>📋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>
                {serviceName || "Service"}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {categoryName || "Category"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3F8EF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="edit-2" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Details */}
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
              <Icon name="map-pin" size={16} color="#17381B" />
              <Text style={{ fontSize: 14, color: "#1F2937", flex: 1 }} numberOfLines={1}>
                {address || "Address not provided"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#F3F8EF",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Icon2 name="calendar-today" size={16} color="#17381B" />
                <Text style={{ fontSize: 13, color: "#1F2937", fontWeight: "600" }}>
                  {scheduledDate || "Today"}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#F3F8EF",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Icon name="clock" size={16} color="#17381B" />
                <Text style={{ fontSize: 13, color: "#1F2937", fontWeight: "600" }}>
                  {scheduledTime || "10:00 AM"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coupon Section */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 8 }}>
            Have a coupon?
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  backgroundColor: "#F3F8EF",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#1F2937",
                  borderWidth: 1.5,
                  borderColor: couponError ? "#DC2626" : "#E5E7EB",
                  height: 44,
                }}
                placeholder="Enter coupon code"
                placeholderTextColor="#9CA3AF"
                value={couponCode}
                onChangeText={setCouponCode}
                editable={!isApplying && appliedDiscount === 0}
              />
              {couponError && (
                <Text style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>
                  {couponError}
                </Text>
              )}
              {couponMessage && (
                <Text style={{ fontSize: 12, color: "#16A34A", marginTop: 4 }}>
                  {couponMessage}
                </Text>
              )}
            </View>
            {appliedDiscount > 0 ? (
              <TouchableOpacity
                onPress={handleRemoveCoupon}
                style={{
                  backgroundColor: "#DC2626",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  height: 44,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleApplyCoupon}
                disabled={isApplying}
                style={{
                  backgroundColor: isApplying ? "#9CA3AF" : "#17381B",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  height: 44,
                  justifyContent: "center",
                }}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>Apply</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Price Breakdown */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
            Price Breakdown
          </Text>
          <Row label="Base Service Charge" value={`₹${breakdown.base}`} />
          <Row label="Platform Fee (5%)" value={`₹${breakdown.platform_fee}`} />
          <Row label="GST (18%)" value={`₹${breakdown.gst}`} />
          {appliedDiscount > 0 && (
            <Row label="Discount Applied" value={`-₹${appliedDiscount}`} accent={true} />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 14,
              marginTop: 4,
              borderTopWidth: 2,
              borderTopColor: "#17381B",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>
              Total Amount
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#17381B" }}>
              ₹{breakdown.total}
            </Text>
          </View>
        </View>
        <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>
              Special Instructions <Text style={{ color: "#DC2626" }}>*</Text>
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: "#F3F8EF",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                color: "#1F2937",
                borderWidth: 1.5,
                borderColor: specialInstructions ? "#17381B" : "#E5E7EB",
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="Enter your complete address"
              placeholderTextColor="#9CA3AF"
              multiline
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
            />
          </View>

        {/* Cancellation Policy */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon3 name="file-contract" size={14} color="#17381B" />
            <Text style={{ fontSize: 13, fontWeight: "800", color:"#17381B", marginBottom: 4 }}>
              Cancellation Policy
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#374151", lineHeight: 20 }}>
            Free cancellation up to 2 hours before service. Late cancellation may incur a ₹50 fee.
          </Text>
        </View>

        {/* CTA */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85} disabled={loading}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: loading ? "#9CA3AF" : "#17381B",
                shadowColor: "#17381B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
                {loading ? "Creating Booking..." : `Confirm Booking ₹${breakdown.total}`}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 12 }}>
            <Text style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}>
              ✏️ Edit Details
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}