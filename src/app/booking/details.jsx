import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform,
  KeyboardAvoidingView, StatusBar, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { getServiceById } from "../../../services/api/services";
import { getMyAddresses, createAddress } from "../../../services/api/address";
import LocationPickerModal from "../../components/LocationPickerModal";
import { useCart } from "../../context/CartContext";
import { calculateUnitPrice } from "../../utils/cartPricing";

// ─── Static data ────────────────────────────────────────────────
const TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const getDateLabels = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (i === 0) dates.push("Today");
    else if (i === 1) dates.push("Tomorrow");
    else {
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      dates.push(`${dayName} ${date.getDate()}`);
    }
  }
  return dates;
};

const convertToMySQLTime = (time) => {
  if (!time) return "10:00:00";
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error("Invalid scheduledTime format. Use HH:mm:ss or hh:mm AM/PM");
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};

const DATES_LABELS = getDateLabels();

// ─── Time helpers ───────────────────────────────────────────────
const timeToMinutes = (time) => {
  const [timePart, period] = time.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const isSlotInPast = (slot) => {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return timeToMinutes(slot) <= nowMins;
};

const getNextAvailableSlot = () => {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (const t of TIMES) if (timeToMinutes(t) > nowMins) return t;
  return null;
};

const toLocalISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getDateString = (label) => {
  const today = new Date();
  if (label === "Today") return toLocalISO(today);
  if (label === "Tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toLocalISO(tomorrow);
  }
  const parts = label.split(" ");
  if (parts.length === 2) {
    const day = parseInt(parts[1]);
    const month = today.getMonth();
    const year = today.getFullYear();
    let dateObj = new Date(year, month, day);
    if (dateObj < today && dateObj.toDateString() !== today.toDateString()) {
      dateObj = new Date(year, month + 1, day);
    }
    return toLocalISO(dateObj);
  }
  return toLocalISO(today);
};

// ─── Quantity Picker ────────────────────────────────────────────
function QuantityPicker({ value, onChange, min = 1, max = 10, unitPrice = 0, label = "Quantity" }) {
  const dec = () => value > min && onChange(value - 1);
  const inc = () => value < max && onChange(value + 1);
  const lineTotal = Math.max(0, (unitPrice || 0) * value);

  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#F3F8EF", borderRadius: 14, padding: 12,
        borderWidth: 1.5, borderColor: "#E5E7EB",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#1F2937" }}>
          {label}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          ₹{unitPrice.toFixed(0)} × {value} ={" "}
          <Text style={{ color: "#17381B", fontWeight: "800" }}>
            ₹{lineTotal.toFixed(0)}
          </Text>
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <TouchableOpacity
          onPress={dec}
          disabled={value <= min}
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: value <= min ? "#E5E7EB" : "#17381B",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="minus" size={18} color={value <= min ? "#9CA3AF" : "#FFFFFF"} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 22, fontWeight: "900", color: "#1F2937",
            minWidth: 30, textAlign: "center",
          }}
        >
          {value}
        </Text>

        <TouchableOpacity
          onPress={inc}
          disabled={value >= max}
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: value >= max ? "#E5E7EB" : "#17381B",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="plus" size={18} color={value >= max ? "#9CA3AF" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════
// Main screen
// ═════════════════════════════════════════════════════════════════
export default function BookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryName = params.categoryName?.toString() || "";
  const serviceId = params.serviceId?.toString() || "";

  const { addItem, patchCart, itemsCount } = useCart();

  // ── State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({});
  const [quantity, setQuantity] = useState(1);

  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState("now");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [manualAddress, setManualAddress] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // ── Derived values — MUST come before any early return ────
  const liveUnitPrice = useMemo(
    () => calculateUnitPrice(service, formData),
    [service, formData],
  );

  const priceCalc = service?.metadata?.priceCalculation;
  const priceCalcType = priceCalc?.type;
  const perSqftRate =
    priceCalcType === "per_sqft" ||
    priceCalcType === "per_sqft_from_option" ||
    priceCalcType === "per_sqft_gender"
      ? priceCalc?.rate
      : null;

  // For labour services, resolve the actual sub-calculation to label the picker
  const resolvedCalc = useMemo(() => {
    if (!priceCalc) return null;
    if (priceCalc.type === "conditional") {
      return priceCalc.cases?.[formData?.billingBasis] || null;
    }
    return priceCalc;
  }, [priceCalc, formData?.billingBasis]);

  const quantityLabel = useMemo(() => {
    if (resolvedCalc?.type === "hourly_gender") return "Hours";
    if (resolvedCalc?.type === "daily_gender") return "Days";
    return "Quantity";
  }, [resolvedCalc?.type]);

  const quantityMax = useMemo(() => {
    if (quantityLabel === "Days") return 30;
    if (quantityLabel === "Hours") return 24;
    return 10;
  }, [quantityLabel]);

  const isBusy = savingAddress || addingToCart;

  // ── Field visibility — inside the component so it sees formData ──
  const isFieldVisible = useCallback(
    (field) => {
      const basis = formData?.billingBasis;

      if (field.key === "workerHours") return basis === "Hourly";
      if (field.key === "workerDays") return basis === "Daily";
      if (field.key === "area") {
        // area is used by many per-sqft services without a basis selector.
        // Only hide it when a basis is set and doesn't match.
        return !basis || basis === "Area (sq ft)";
      }

      return true;
    },
    [formData?.billingBasis],
  );

  // ── Validation — inside the component ──────────────────────
  const validateLabour = useCallback(() => {
    const fields = service?.metadata?.formFields || [];
    const hasGender = fields.some((f) => f.key === "workerGender");
    const hasBasis = fields.some((f) => f.key === "billingBasis");

    if (hasGender && !formData.workerGender) {
      return "Please select worker gender.";
    }
    if (!hasBasis) return null;

    const basis = formData.billingBasis;
    if (!basis) return "Please select a billing basis.";
    if (basis === "Hourly" && !formData.workerHours) {
      return "Please enter number of hours.";
    }
    if (basis === "Daily" && !formData.workerDays) {
      return "Please enter number of days.";
    }
    if (basis === "Area (sq ft)" && !formData.area) {
      return "Please enter area.";
    }
    return null;
  }, [service, formData]);

  // ── Init ───────────────────────────────────────────────────
  useEffect(() => {
    if (!serviceId) {
      Alert.alert("Error", "Service ID is missing", [
        { text: "Go Back", onPress: () => router.back() },
      ]);
      return;
    }
    fetchService();
    fetchAddresses();

    const nextSlot = getNextAvailableSlot();
    if (nextSlot) {
      setSelectedTime(nextSlot);
      setSelectedDate("Today");
    } else {
      setSelectedDate("Tomorrow");
      setSelectedTime(TIMES[0]);
    }
  }, [serviceId]);

  // Reset form + quantity when service changes
  useEffect(() => {
    setFormData({});
    setQuantity(1);
  }, [serviceId]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const response = await getServiceById(parseInt(serviceId));
      setService(response.data);
    } catch (error) {
      console.error("Failed to fetch service:", error);
      Alert.alert("Error", "Could not load service details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await getMyAddresses({ page: 1, limit: 50 });
      const list = res.data.items || [];
      setAddresses(list);

      if (list.length === 0) {
        setShowAddressForm(true);
      } else {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddress(def);
        setShowAddressForm(false);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setShowAddressForm(true);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => {
      const next = { ...(prev || {}), [key]: value };

      // When billingBasis changes, clear the quantity fields that no longer apply
      if (key === "billingBasis") {
        if (value !== "Hourly") next.workerHours = "";
        if (value !== "Daily") next.workerDays = "";
        if (value !== "Area (sq ft)") next.area = "";
      }

      return next;
    });
  };

  const handleBookingTypeChange = (val) => {
    setBookingType(val);
    if (val === "now") {
      const nextSlot = getNextAvailableSlot();
      if (nextSlot) {
        setSelectedDate("Today");
        setSelectedTime(nextSlot);
      } else {
        setSelectedDate("Tomorrow");
        setSelectedTime(TIMES[0]);
      }
    }
  };

  const handleSelectAddress = (addr) => setSelectedAddress(addr);

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setSelectedAddress(null);
    setManualAddress({ address: "", latitude: null, longitude: null });
  };

  const handleLocationSelect = ({ latitude, longitude, address }) => {
    setManualAddress({ address, latitude, longitude });
  };

  // ── Validate + add to cart + navigate ──────────────────────
  const handleNext = async () => {
    // 1. Standard required-field validation
    const fields = service?.metadata?.formFields || [];

    // Exclude conditional quantity fields — those are validated by validateLabour
    const conditionalKeys = ["workerHours", "workerDays", "area"];
    const requiredFields = fields.filter(
      (f) => f.required && !conditionalKeys.includes(f.key),
    );

    const missingFields = requiredFields.filter((field) => {
      const v = formData?.[field.key];
      if (v === null || v === undefined) return true;
      if (typeof v === "string" && v.trim() === "") return true;
      return false;
    });

    if (missingFields.length > 0) {
      Alert.alert(
        "Required Fields",
        `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`,
      );
      return;
    }

    // 2. Labour-specific validation
    const labourError = validateLabour();
    if (labourError) {
      Alert.alert("Incomplete", labourError);
      return;
    }

    // 3. Guard against zero-priced cart lines
    if (liveUnitPrice <= 0) {
      Alert.alert(
        "Price not ready",
        "Please complete the required options so the price can be calculated.",
      );
      return;
    }

    // 4. Resolve address
    let finalAddress, finalLat, finalLng, addressId = null;

    try {
      if (showAddressForm || !selectedAddress) {
        if (!manualAddress.address) {
          Alert.alert("Address Required", "Please pick a location for the new address.");
          return;
        }

        setSavingAddress(true);
        console.log("rrr::",manualAddress);
        const created = await createAddress({
          label: "Other",
          address: manualAddress.address,
          latitude: Number(manualAddress.latitude.toFixed(4)),
          longitude: Number(manualAddress.longitude.toFixed(4)),
          isDefault: addresses.length === 0,
        });
        addressId = created.data.id;
        finalAddress = created.data.address;
        finalLat = created.data.latitude;
        finalLng = created.data.longitude;

        setAddresses((prev) => [created.data, ...prev]);
        setSelectedAddress(created.data);
        setShowAddressForm(false);
      } else {
        finalAddress = selectedAddress.address;
        finalLat = selectedAddress.latitude;
        finalLng = selectedAddress.longitude;
        addressId = selectedAddress.id;
      }
    } catch (err) {
      console.error("Address save failed:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.error || err.message || "Failed to save address",
      );
      setSavingAddress(false);
      return;
    } finally {
      setSavingAddress(false);
    }

    // 5. Add item to cart
    const scheduledDate = getDateString(selectedDate);
    const scheduledTime = convertToMySQLTime(selectedTime);

    try {
      setAddingToCart(true);

      await addItem({
        serviceId: parseInt(serviceId, 10),
        details: {
          ...formData,
          serviceName: service?.name,
          categoryName,
          address: finalAddress,
          latitude: finalLat,
          longitude: finalLng,
        },
        addressId,
        address: finalAddress,
        latitude: finalLat,
        longitude: finalLng,
        quantity,
        scheduledDate,
        scheduledTime,
      });

      try {
        await patchCart({
          addressId,
          scheduledDate,
          scheduledTime,
          bookingType,
        });
      } catch (_) {
        // non-fatal
      }

      router.push("./summary");
    } catch (error) {
      Alert.alert(
        "Cart Error",
        error?.response?.data?.error ||
          error?.message ||
          "Failed to add item to cart",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // ── Loading / not found ────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1, justifyContent: "center", alignItems: "center",
          backgroundColor: "#F3F8EF",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading service details...
        </Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View
        style={{
          flex: 1, justifyContent: "center", alignItems: "center",
          backgroundColor: "#F3F8EF",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6B7280" }}>Service not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fields = service?.metadata?.formFields || [];
  const visibleFields = fields.filter(isFieldVisible);

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "#17381B",
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
              Booking Details
            </Text>
            <Text
              style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}
              numberOfLines={1}
            >
              {service?.name}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{
                backgroundColor: "#E8F5E9",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#17381B" }}>
                ₹
                {liveUnitPrice > 0
                  ? liveUnitPrice.toFixed(0)
                  : parseFloat(service?.basePrice || 0).toFixed(0)}
              </Text>
            </View>
            {perSqftRate ? (
              <Text
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 3,
                }}
              >
                ₹{perSqftRate}/sq ft
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="shopping-cart" size={18} color="#FFFFFF" />
            {itemsCount > 0 && (
              <View
                style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 18, height: 18, borderRadius: 9,
                  backgroundColor: "#E8F5E9",
                  alignItems: "center", justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#17381B" }}>
                  {itemsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        >
          {/* ─── Book Type ──────────────────────────────────── */}
          <View style={cardStyle}>
            <Text style={sectionTitle}>When do you need the service?</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { val: "now", label: "⚡ Book Now", sub: "Worker in ~30 min" },
                { val: "schedule", label: "📅 Schedule Later", sub: "Pick date & time" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => handleBookingTypeChange(opt.val)}
                  style={{
                    flex: 1, borderRadius: 14, padding: 14, borderWidth: 2,
                    borderColor: bookingType === opt.val ? "#17381B" : "#E5E7EB",
                    backgroundColor: bookingType === opt.val ? "#E8F5E9" : "#F8FAFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14, fontWeight: "800",
                      color: bookingType === opt.val ? "#17381B" : "#1F2937",
                      marginBottom: 3,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {bookingType === "now" && (
              <View
                style={{
                  marginTop: 12, flexDirection: "row", alignItems: "center",
                  gap: 8, backgroundColor: "#E8F5E9",
                  padding: 10, borderRadius: 10,
                }}
              >
                <Icon name="clock" size={14} color="#17381B" />
                <Text style={{ fontSize: 12, color: "#17381B", fontWeight: "600" }}>
                  Today · {selectedTime} · Earliest available slot
                </Text>
              </View>
            )}
          </View>

          {/* ─── Date & Time (Schedule) ─────────────────────── */}
          {bookingType === "schedule" && (
            <View style={cardStyle}>
              <View
                style={{
                  flexDirection: "row", alignItems: "center",
                  gap: 8, marginBottom: 14,
                }}
              >
                <Icon2 name="calendar-today" size={18} color="#17381B" />
                <Text style={sectionTitle2}>Select Date</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                style={{ flexGrow: 0 }}
              >
                {DATES_LABELS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setSelectedDate(d)}
                    style={{
                      paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14,
                      backgroundColor: selectedDate === d ? "#17381B" : "#F3F8EF",
                      borderWidth: selectedDate === d ? 0 : 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14, fontWeight: "700",
                        color: selectedDate === d ? "#FFFFFF" : "#1F2937",
                      }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View
                style={{
                  flexDirection: "row", alignItems: "center",
                  gap: 8, marginTop: 16, marginBottom: 14,
                }}
              >
                <Icon name="clock" size={18} color="#17381B" />
                <Text style={sectionTitle2}>Select Time</Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TIMES.map((t) => {
                  const disabled = selectedDate === "Today" && isSlotInPast(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => !disabled && setSelectedTime(t)}
                      disabled={disabled}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
                        backgroundColor: disabled
                          ? "#F3F4F6"
                          : selectedTime === t
                            ? "#17381B"
                            : "#F3F8EF",
                        borderWidth: disabled || selectedTime === t ? 0 : 1,
                        borderColor: "#E5E7EB",
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13, fontWeight: "600",
                          color: disabled
                            ? "#9CA3AF"
                            : selectedTime === t
                              ? "#FFFFFF"
                              : "#1F2937",
                        }}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ─── Dynamic Form Fields ────────────────────────── */}
          <View style={[cardStyle, { gap: 14 }]}>
            <Text style={sectionTitle}>Service Information</Text>
            {visibleFields.length > 0 ? (
              visibleFields.map((field) => {
                const value = formData[field.key] ?? "";
                return (
                  <View key={field.key}>
                    <View
                      style={{
                        flexDirection: "row", alignItems: "center",
                        justifyContent: "space-between", marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13, fontWeight: "700", color: "#1F2937",
                        }}
                      >
                        {field.label}
                        {field.required && (
                          <Text style={{ color: "#DC2626" }}>*</Text>
                        )}
                      </Text>
                      {!field.required && (
                        <Text
                          style={{
                            fontSize: 11, color: "#6B7280",
                            backgroundColor: "#F3F4F6",
                            paddingHorizontal: 7, paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          Optional
                        </Text>
                      )}
                    </View>

                    {field.type === "select" ? (
                      <View
                        style={{
                          backgroundColor: "#F3F8EF",
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: value ? "#17381B" : "#E5E7EB",
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                        }}
                      >
                        {field.options?.map((opt) => {
                          const optValue =
                            typeof opt === "string" ? opt : opt.value;
                          const optPrice =
                            typeof opt === "object" ? opt.price : 0;
                          const isSelected = value === optValue;
                          return (
                            <TouchableOpacity
                              key={optValue}
                              onPress={() => handleFieldChange(field.key, optValue)}
                              style={{
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: "#E5E7EB",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                              }}
                            >
                              <Text
                                style={{ fontSize: 14, color: "#1F2937", flex: 1 }}
                              >
                                {optValue}
                              </Text>

                              {optPrice > 0 && (
                                <Text
                                  style={{
                                    fontSize: 13, fontWeight: "800",
                                    color: isSelected ? "#17381B" : "#6B7280",
                                  }}
                                >
                                  ₹{optPrice}
                                </Text>
                              )}
                              {optPrice < 0 && (
                                <Text
                                  style={{
                                    fontSize: 12, fontWeight: "700",
                                    color: "#DC2626",
                                  }}
                                >
                                  −₹{Math.abs(optPrice)}
                                </Text>
                              )}

                              {isSelected && (
                                <Icon name="check" size={16} color="#17381B" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : field.type === "boolean" ? (
                      <TouchableOpacity
                        onPress={() => handleFieldChange(field.key, !value)}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          backgroundColor: value ? "#17381B" : "#F3F8EF",
                          borderRadius: 12,
                          paddingVertical: 12, paddingHorizontal: 16,
                          borderWidth: 1.5,
                          borderColor: value ? "#17381B" : "#E5E7EB",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14, fontWeight: "600",
                              color: value ? "#FFFFFF" : "#1F2937",
                            }}
                          >
                            {field.label}
                          </Text>
                          {field.price > 0 && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: value
                                  ? "rgba(255,255,255,0.7)"
                                  : "#6B7280",
                                marginTop: 2,
                              }}
                            >
                              +₹{field.price}
                            </Text>
                          )}
                        </View>
                        <View
                          style={{
                            width: 20, height: 20, borderRadius: 10,
                            backgroundColor: value ? "#FFFFFF" : "#E5E7EB",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {value && (
                            <Icon name="check" size={14} color="#17381B" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={{
                          backgroundColor: "#F3F8EF",
                          borderRadius: 12,
                          padding: 14,
                          fontSize: 14,
                          color: "#1F2937",
                          borderWidth: 1.5,
                          borderColor: value ? "#17381B" : "#E5E7EB",
                          height: field.type === "textarea" ? 90 : 52,
                          textAlignVertical:
                            field.type === "textarea" ? "top" : "center",
                        }}
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.label.toLowerCase()}`
                        }
                        placeholderTextColor="#9CA3AF"
                        keyboardType={
                          field.type === "number" ? "numeric" : "default"
                        }
                        multiline={field.type === "textarea"}
                        value={String(value)}
                        onChangeText={(t) => handleFieldChange(field.key, t)}
                      />
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "#6B7280" }}>
                No additional information required.
              </Text>
            )}
          </View>

          {/* ─── Quantity ───────────────────────────────────── */}
          <View style={cardStyle}>
            <Text style={sectionTitle}>
              How many {quantityLabel === "Quantity" ? "do" : quantityLabel.toLowerCase() + " do"} you need?
            </Text>
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={quantityMax}
              unitPrice={liveUnitPrice}
              label={quantityLabel}
            />
          </View>

          {/* ─── Address Section ────────────────────────────── */}
          <View style={[cardStyle, { gap: 12 }]}>
            <View
              style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={sectionTitle}>
                Delivery Address <Text style={{ color: "#DC2626" }}>*</Text>
              </Text>
              {!showAddressForm && addresses.length > 0 && (
                <TouchableOpacity onPress={handleAddNewAddress}>
                  <Text
                    style={{ fontSize: 12, color: "#17381B", fontWeight: "800" }}
                  >
                    + Add New
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {addressLoading ? (
              <ActivityIndicator size="small" color="#17381B" />
            ) : (
              <>
                {!showAddressForm && addresses.length > 0 && (
                  <View style={{ gap: 10 }}>
                    {addresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id;
                      return (
                        <TouchableOpacity
                          key={addr.id}
                          onPress={() => handleSelectAddress(addr)}
                          style={{
                            flexDirection: "row", alignItems: "center",
                            gap: 12,
                            backgroundColor: isSelected ? "#E8F5E9" : "#F9FAFB",
                            borderRadius: 12, padding: 14,
                            borderWidth: 1.5,
                            borderColor: isSelected ? "#17381B" : "#E5E7EB",
                          }}
                        >
                          <View
                            style={{
                              width: 36, height: 36, borderRadius: 18,
                              backgroundColor: isSelected ? "#17381B" : "#E5E7EB",
                              alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <Icon
                              name={addr.label === "Home" ? "home" : "briefcase"}
                              size={16}
                              color={isSelected ? "#FFFFFF" : "#6B7280"}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View
                              style={{
                                flexDirection: "row", alignItems: "center", gap: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13, fontWeight: "800", color: "#1F2937",
                                }}
                              >
                                {addr.label || "Address"}
                              </Text>
                              {addr.isDefault && (
                                <View
                                  style={{
                                    backgroundColor: "#DCFCE7",
                                    paddingHorizontal: 6, paddingVertical: 2,
                                    borderRadius: 4,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 9, fontWeight: "800",
                                      color: "#16A34A",
                                    }}
                                  >
                                    DEFAULT
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                              numberOfLines={2}
                            >
                              {addr.address}
                            </Text>
                          </View>
                          {isSelected && (
                            <Icon name="check-circle" size={20} color="#16A34A" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {showAddressForm && (
                  <View style={{ gap: 10 }}>
                    {addresses.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setShowAddressForm(false);
                          const def =
                            addresses.find((a) => a.isDefault) || addresses[0];
                          setSelectedAddress(def);
                        }}
                        style={{
                          flexDirection: "row", alignItems: "center",
                          gap: 6, marginBottom: 4,
                        }}
                      >
                        <Icon name="arrow-left" size={14} color="#17381B" />
                        <Text
                          style={{
                            fontSize: 12, color: "#17381B", fontWeight: "700",
                          }}
                        >
                          Back to saved addresses
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => setShowLocationModal(true)}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 12,
                        backgroundColor: manualAddress.address
                          ? "#F3F8EF"
                          : "#17381B",
                        borderRadius: 12, padding: 14,
                        borderWidth: manualAddress.address ? 1 : 0,
                        borderColor: "#17381B",
                      }}
                    >
                      <View
                        style={{
                          width: 36, height: 36, borderRadius: 18,
                          backgroundColor: manualAddress.address
                            ? "#17381B"
                            : "rgba(255,255,255,0.2)",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Icon name="map-pin" size={16} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: manualAddress.address
                              ? "#6B7280"
                              : "rgba(255,255,255,0.8)",
                            fontWeight: "600",
                          }}
                        >
                          {manualAddress.address
                            ? "Selected Location"
                            : "Tap to pick on map"}
                        </Text>
                        {manualAddress.address ? (
                          <Text
                            style={{
                              fontSize: 13, color: "#1F2937",
                              fontWeight: "700", marginTop: 2,
                            }}
                            numberOfLines={2}
                          >
                            {manualAddress.address}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontSize: 14, color: "#FFFFFF",
                              fontWeight: "800", marginTop: 2,
                            }}
                          >
                            Pick Location on Map
                          </Text>
                        )}
                      </View>
                      <Icon
                        name="chevron-right"
                        size={18}
                        color={manualAddress.address ? "#17381B" : "#FFFFFF"}
                      />
                    </TouchableOpacity>

                    {manualAddress.address && (
                      <TextInput
                        style={{
                          backgroundColor: "#F3F8EF",
                          borderRadius: 12, padding: 14, fontSize: 14,
                          color: "#1F2937",
                          borderWidth: 1.5, borderColor: "#17381B",
                          minHeight: 60, textAlignVertical: "top",
                        }}
                        value={manualAddress.address}
                        onChangeText={(t) =>
                          setManualAddress((prev) => ({ ...prev, address: t }))
                        }
                        placeholder="Add landmark, flat no., etc."
                        placeholderTextColor="#9CA3AF"
                        multiline
                      />
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Info note */}
          <View
            style={{
              flexDirection: "row", alignItems: "flex-start", gap: 10,
              backgroundColor: "#E8F5E9",
              borderRadius: 14, padding: 14,
              borderWidth: 1, borderColor: "#17381B",
            }}
          >
            <Icon
              name="info" size={16} color="#17381B"
              style={{ marginTop: 1 }}
            />
            <Text
              style={{ fontSize: 13, color: "#17381B", flex: 1, lineHeight: 20 }}
            >
              A verified worker will be assigned after you confirm the booking.
              Exact charges may vary based on work scope.
            </Text>
          </View>

          {/* Continue */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={isBusy}
            activeOpacity={0.85}
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
                opacity: isBusy ? 0.7 : 1,
              }}
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="shopping-cart" size={18} color="#FFFFFF" />
                  <Text
                    style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}
                  >
                    Continue to Summary
                  </Text>
                  <Icon
                    name="chevron-right" size={20} color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
        initialAddress={manualAddress.address}
      />
    </View>
  );
}

// ─── Shared styles ──────────────────────────────────────────────
const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: "800",
  color: "#1F2937",
  marginBottom: 12,
};

const sectionTitle2 = {
  fontSize: 15,
  fontWeight: "800",
  color: "#1F2937",
};