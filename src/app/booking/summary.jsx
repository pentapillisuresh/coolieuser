import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StatusBar,
  ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import * as SecureStore from "expo-secure-store";
import { useCart } from "../../context/CartContext";
import { validateCoupon } from "../../../services/api/promotions";
import { getMyAddresses } from "../../../services/api/address";
import { useRef } from "react";

const GREEN = "#17381B";
const GST_RATE = 0.18;
const convenienceCharges = 0.03;

// ─── Static time/date helpers ─────────────────────────────────────
const TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const getDateLabels = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (i === 0) dates.push("Today");
    else if (i === 1) dates.push("Tomorrow");
    else {
      const dn = d.toLocaleDateString("en-US", { weekday: "short" });
      dates.push(`${dn} ${d.getDate()}`);
    }
  }
  return dates;
};

const DATES_LABELS = getDateLabels();

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
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return toLocalISO(t);
  }
  const parts = label.split(" ");
  if (parts.length === 2) {
    const day = parseInt(parts[1], 10);
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

const convertToMySQLTime = (time) => {
  if (!time) return "10:00:00";
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "10:00:00";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const p = m[3].toUpperCase();
  if (p === "AM" && h === 12) h = 0;
  if (p === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${min}:00`;
};

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [tp, period] = t.split(" ");
  if (!period) return 0;
  let [h, m] = tp.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const isSlotInPast = (slot) => {
  const now = new Date();
  return timeToMinutes(slot) <= now.getHours() * 60 + now.getMinutes();
};

const mysqlToDisplayTime = (mysql) => {
  if (!mysql) return null;
  const [hStr, mStr] = mysql.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
};

// ═════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════

function QuantityStepper({ value, onChange, min = 1, max = 20, busy }) {
  const dec = () => !busy && value > min && onChange(value - 1);
  const inc = () => !busy && value < max && onChange(value + 1);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F8EF",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 4,
        paddingVertical: 2,
      }}
    >
      <TouchableOpacity
        onPress={dec}
        disabled={busy || value <= min}
        style={{
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: value <= min || busy ? "#E5E7EB" : GREEN,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon name="minus" size={14} color={value <= min || busy ? "#9CA3AF" : "#FFF"} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 15, fontWeight: "900", color: "#1F2937",
          minWidth: 32, textAlign: "center",
        }}
      >
        {busy ? "…" : value}
      </Text>
      <TouchableOpacity
        onPress={inc}
        disabled={busy || value >= max}
        style={{
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: value >= max || busy ? "#E5E7EB" : GREEN,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon name="plus" size={14} color={value >= max || busy ? "#9CA3AF" : "#FFF"} />
      </TouchableOpacity>
    </View>
  );
}

function EditItemSheet({
  visible, onClose, item, addresses, onSave, insets, saving, safeAlert
}) {
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState(TIMES[0]);
  const [addressId, setAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState(null);

  useEffect(() => {
    if (!item || !visible) return;
    const itemDate = item.scheduledDate
      ? (() => {
        const d = new Date(item.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.round((d - today) / 86400000);
        if (diff === 0) return "Today";
        if (diff === 1) return "Tomorrow";
        const dn = d.toLocaleDateString("en-US", { weekday: "short" });
        return `${dn} ${d.getDate()}`;
      })()
      : "Today";

    setDate(itemDate);
    setTime(mysqlToDisplayTime(item.scheduledTime) || TIMES[0]);
    setAddressId(item.addressId || null);
    setManualAddress(
      !item.addressId && item.address
        ? { address: item.address, latitude: item.latitude, longitude: item.longitude }
        : null
    );
  }, [item, visible]);

  const handleSave = () => {
    const scheduledDate = getDateString(date);
    const scheduledTime = convertToMySQLTime(time);

    const patch = { scheduledDate, scheduledTime };

    if (addressId) {
      const addr = addresses.find((a) => a.id === addressId);
      if (addr) {
        patch.addressId = addr.id;
        patch.address = addr.address;
        patch.latitude = addr.latitude;
        patch.longitude = addr.longitude;
      }
    } else if (manualAddress) {
      patch.addressId = null;
      patch.address = manualAddress.address;
      patch.latitude = manualAddress.latitude;
      patch.longitude = manualAddress.longitude;
    }

    onSave(patch);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { }}
            style={{
              backgroundColor: "#FFF",
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              paddingHorizontal: 20, paddingTop: 12,
              paddingBottom: insets.bottom + 20,
              maxHeight: "88%",
            }}
          >
            <View
              style={{
                width: 40, height: 4, borderRadius: 2,
                backgroundColor: "#E5E7EB",
                alignSelf: "center", marginBottom: 12,
              }}
            />
            <View
              style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>
                Edit Schedule
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: "#F3F8EF",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="x" size={18} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row", alignItems: "center", gap: 10,
                  backgroundColor: "#F3F8EF", borderRadius: 12, padding: 12,
                  marginBottom: 16,
                }}
              >
                <Icon name="package" size={16} color={GREEN} />
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#1F2937", flex: 1 }}
                  numberOfLines={1}
                >
                  {item?.details?.serviceName || item?.Service?.name || "Item"}
                </Text>
              </View>

              <Text style={sheetLabel}>Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                style={{ flexGrow: 0, marginBottom: 16 }}
              >
                {DATES_LABELS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDate(d)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: date === d ? GREEN : "#F3F8EF",
                      borderWidth: date === d ? 0 : 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13, fontWeight: "700",
                        color: date === d ? "#FFF" : "#1F2937",
                      }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={sheetLabel}>Time</Text>
              <View
                style={{
                  flexDirection: "row", flexWrap: "wrap", gap: 8,
                  marginBottom: 16,
                }}
              >
                {TIMES.map((t) => {
                  const disabled = date === "Today" && isSlotInPast(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => !disabled && setTime(t)}
                      disabled={disabled}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 9,
                        borderRadius: 12,
                        backgroundColor: disabled
                          ? "#F3F4F6"
                          : time === t ? GREEN : "#F3F8EF",
                        borderWidth: disabled || time === t ? 0 : 1,
                        borderColor: "#E5E7EB",
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13, fontWeight: "600",
                          color: disabled
                            ? "#9CA3AF"
                            : time === t ? "#FFF" : "#1F2937",
                        }}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={sheetLabel}>Address</Text>
              {addresses.length === 0 ? (
                <View
                  style={{
                    backgroundColor: "#FEF3C7",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#92400E" }}>
                    No saved addresses. Add one from your profile.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {addresses.map((addr) => {
                    const selected = addressId === addr.id;
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => { setAddressId(addr.id); setManualAddress(null); }}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 12,
                          backgroundColor: selected ? "#E8F5E9" : "#F9FAFB",
                          borderRadius: 12, padding: 12,
                          borderWidth: 1.5,
                          borderColor: selected ? GREEN : "#E5E7EB",
                        }}
                      >
                        <View
                          style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: selected ? GREEN : "#E5E7EB",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Icon
                            name={addr.label === "Home" ? "home" : "briefcase"}
                            size={14}
                            color={selected ? "#FFF" : "#6B7280"}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ fontSize: 12, fontWeight: "800", color: "#1F2937" }}
                          >
                            {addr.label || "Address"}
                            {addr.isDefault ? "  ·  Default" : ""}
                          </Text>
                          <Text
                            style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}
                            numberOfLines={2}
                          >
                            {addr.address}
                          </Text>
                        </View>
                        {selected && (
                          <Icon name="check-circle" size={18} color="#16A34A" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {!addressId && manualAddress && (
                <View
                  style={{
                    backgroundColor: "#F3F8EF", borderRadius: 12,
                    padding: 12, marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                    Custom address on this item
                  </Text>
                  <Text style={{ fontSize: 13, color: "#1F2937", fontWeight: "600" }}>
                    {manualAddress.address}
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? "#9CA3AF" : GREEN,
                height: 50, borderRadius: 14,
                alignItems: "center", justifyContent: "center",
                marginTop: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "800" }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sheetLabel = {
  fontSize: 12,
  fontWeight: "800",
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: 0.6,
  marginBottom: 8,
};

// ═════════════════════════════════════════════════════════════════
// Main screen
// ═════════════════════════════════════════════════════════════════
export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    items = [],
    cart,
    updateItem,
    removeItem,
    patchCart,
    loading,
    mutating,
  } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promotionId, setPromotionId] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** Safe alert — no-ops if the screen is gone. */
  const safeAlert = useCallback((title, msg, buttons) => {
    if (!mountedRef.current) return;
    Alert.alert(title, msg, buttons);
  }, []);

  // ── Load addresses + user ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [addrRes, userStr] = await Promise.all([
          getMyAddresses({ page: 1, limit: 50 }),
          SecureStore.getItemAsync("userData"),
        ]);
        setAddresses(addrRes?.data?.items || addrRes?.items || []);
        if (userStr) setUserData(JSON.parse(userStr));
      } catch (e) {
        console.error("Summary init error:", e);
      }
    })();
  }, []);

  // ── Quantity change ───────────────────────────────────────
  const handleQtyChange = useCallback(async (item, next) => {
    try {
      await updateItem(item.id, { quantity: next });
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || "Failed to update quantity");
    }
  }, [updateItem]);

  // ── Delete item ───────────────────────────────────────────
  const handleDeleteItem = useCallback((item) => {
    if (!mountedRef.current) return;

    const name =
      item?.details?.serviceName || item?.Service?.name || "this item";

    Alert.alert(
      "Remove item",
      `Remove "${name}" from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await removeItem(item.id);
            } catch (e) {
              Alert.alert(
                "Error",
                e?.response?.data?.error || "Failed to remove item",
              );
            } finally {
              if (mountedRef.current) setDeletingId(null);
            }
          },
        },
      ],
    );
  }, [removeItem]);

  // ── Item edit save ────────────────────────────────────────
  const handleSaveItemEdit = async (patch) => {
    if (!editingItem) return;
    setSavingItem(true);
    try {
      await updateItem(editingItem.id, patch);
      setEditingItem(null);
    } catch (e) {
      if (mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current) {
            Alert.alert("Error", e?.response?.data?.error || "Failed to update item");
          }
        }, 150);
      }
    } finally {
      setSavingItem(false);
    }
  };

  // ── Coupon ────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setIsApplying(true);
    setCouponError(null);
    setCouponMessage(null);
    try {
      const response = await validateCoupon(couponCode.trim(), userData?.mobile);
      if (response?.success) {
        const sub = items.reduce((s, it) => s + (parseFloat(it.lineTotal) || 0), 0);
        let discountAmount = 0;
        if (response.data.discountType === "percentage") {
          discountAmount = Math.round((sub * response.data.discountValue) / 100);
        } else {
          discountAmount = response.data.discountValue;
        }
        setAppliedDiscount(discountAmount);
        setPromotionId(response.data.id || null);
        setCouponMessage(response.message || "Coupon applied successfully!");
      } else {
        setCouponError(response?.message || "Invalid coupon code");
        setAppliedDiscount(0);
        setPromotionId(null);
      }
    } catch (error) {
      setCouponError(error?.message || "Failed to verify coupon");
      setAppliedDiscount(0);
      setPromotionId(null);
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

  // ── Confirm booking ───────────────────────────────────────
  const handleConfirm = async () => {
    if (!items.length) {
      Alert.alert("Empty cart", "Add a service to continue.");
      return;
    }

    setConfirming(true);
    try {
      // Persist the discount + promotion to the cart so the confirm
      // screen (and the backend checkout) sees the same totals.
      console.log("appliedDiscount::", appliedDiscount)
      await patchCart({
        discountAmount: appliedDiscount || 0,
        promotionId: promotionId || null,
        convenienceCharges: convenience || 0
      });

      if (!mountedRef.current) return;

      Alert.alert("Success", "Booking created successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/booking/confirm",
              params: {
                discountAmount: appliedDiscount,
                promotionId: promotionId,
              },
            }),
        },
      ]);
    } catch (error) {
      if (!mountedRef.current) return;
      Alert.alert(
        "Error",
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update cart.",
      );
    } finally {
      if (mountedRef.current) setConfirming(false);
    }
  };

  // ── Totals ────────────────────────────────────────────────
  const subtotal = items.reduce((s, it) => s + (parseFloat(it.lineTotal) || 0), 0);
  const discount = appliedDiscount;
  const taxable = Math.max(0, subtotal - discount);
  const gst = +(taxable * GST_RATE).toFixed(2);
  const convenience = +(taxable * convenienceCharges).toFixed(2);
  const total = +(taxable + gst + convenience).toFixed(2);

  // ── Loading / empty ───────────────────────────────────────
  if (loading && items.length === 0) {
    return (
      <View
        style={{
          flex: 1, backgroundColor: "#F3F8EF",
          justifyContent: "center", alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading cart...</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View
        style={{
          flex: 1, backgroundColor: "#F3F8EF",
          justifyContent: "center", alignItems: "center", padding: 20,
        }}
      >
        <Icon name="shopping-cart" size={48} color="#9CA3AF" />
        <Text
          style={{
            fontSize: 16, color: "#6B7280",
            textAlign: "center", marginTop: 12,
          }}
        >
          Your cart is empty.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: GREEN, fontWeight: "700" }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              Booking Summary
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {items.length} {items.length === 1 ? "item" : "items"} in cart
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
      >
        {/* ── Cart Items ──────────────────────────────────── */}
        {items.map((item, idx) => {
          const name =
            item?.details?.serviceName ||
            item?.Service?.name ||
            "Service";
          const category =
            item?.details?.categoryName ||
            item?.Service?.Category?.name ||
            "Category";
          const lineTotal = parseFloat(item.lineTotal) || 0;
          const displayDate = item.scheduledDate
            ? new Date(item.scheduledDate).toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short",
            })
            : "Today";
          const displayTime =
            mysqlToDisplayTime(item.scheduledTime) || "10:00 AM";
          const displayAddress =
            item.address ||
            addresses.find((a) => a.id === item.addressId)?.address ||
            "Address not set";
          const isDeleting = deletingId === item.id;

          return (
            <View
              key={item.id}
              style={{
                backgroundColor: "#FFF",
                borderRadius: 18,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              {/* Header row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 46, height: 46, borderRadius: 12,
                    backgroundColor: "#E8F5E9",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>
                    {idx === 0 ? "📋" : idx === 1 ? "🛠️" : "🧰"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "900", color: "#1F2937" }}
                    numberOfLines={2}
                  >
                    {name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {category}
                  </Text>
                </View>

                {/* Edit + Delete buttons */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setEditingItem(item)}
                    disabled={isDeleting}
                    style={{
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: "#F3F8EF",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon name="edit-2" size={15} color={GREEN} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    disabled={isDeleting || mutating}
                    style={{
                      width: 34, height: 34, borderRadius: 17,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <Icon name="trash-2" size={15} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info rows */}
              <View style={{ gap: 8, marginBottom: 12 }}>
                <InfoRow
                  icon="calendar"
                  color={GREEN}
                  label={displayDate}
                  secondary={displayTime}
                />
                <InfoRow
                  icon="map-pin"
                  color={GREEN}
                  label={displayAddress}
                  numberOfLines={2}
                />
              </View>

              {/* Qty + line total */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#F3F8EF",
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>Quantity</Text>
                  <Text style={{ fontSize: 12, color: "#1F2937", fontWeight: "700", marginTop: 2 }}>
                    ₹{(parseFloat(item.unitPrice) || 0).toFixed(0)} each
                  </Text>
                </View>

                <QuantityStepper
                  value={item.quantity || 1}
                  onChange={(next) => handleQtyChange(item, next)}
                  busy={mutating || isDeleting}
                />

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>Total</Text>
                  <Text
                    style={{ fontSize: 18, fontWeight: "900", color: GREEN, marginTop: 2 }}
                  >
                    ₹{lineTotal.toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <TouchableOpacity 
        onPress={()=>router.replace("/booking/categories")}          
        style={{
            backgroundColor: "#FFF",
            borderRadius: 15,
            padding: 12,justifyContent:"center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
>
          <Text style={{ fontSize: 15,alignSelf:'center', fontWeight: "700", color: "#16A34A", marginStart: 8 }}>
            Add More Services +
          </Text>
        </TouchableOpacity>

        {/* ── Coupon ──────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "#FFF",
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
                autoCapitalize="characters"
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
                  height: 44,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                  Remove
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleApplyCoupon}
                disabled={isApplying}
                style={{
                  backgroundColor: isApplying ? "#9CA3AF" : GREEN,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 44,
                  justifyContent: "center",
                }}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                    Apply
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Price breakdown ─────────────────────────────── */}
        <View
          style={{
            backgroundColor: "#FFF",
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
          <Row label="Subtotal" value={`₹${subtotal.toFixed(0)}`} />
          <Row label={`GST (${(GST_RATE * 100).toFixed(0)}%)`} value={`₹${gst.toFixed(0)}`} />
          {convenience > 0 && (
            <Row label="Convenience Fee" value={`₹${convenience.toFixed(0)}`} />
          )}
          {discount > 0 && (
            <Row label="Discount Applied" value={`-₹${discount}`} accent />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 14,
              marginTop: 4,
              borderTopWidth: 2,
              borderTopColor: GREEN,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>
              Total Amount
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: GREEN }}>
              ₹{total.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* ── Special instructions ────────────────────────── */}
        <View>
          <Text
            style={{
              fontSize: 13, fontWeight: "700", color: "#1F2937", marginBottom: 8,
            }}
          >
            Special Instructions
          </Text>
          <TextInput
            style={{
              backgroundColor: "#F3F8EF",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: "#1F2937",
              borderWidth: 1.5,
              borderColor: specialInstructions ? GREEN : "#E5E7EB",
              height: 80,
              textAlignVertical: "top",
            }}
            placeholder="Any notes for the worker..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
          />
        </View>

        {/* ── Policy ──────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: GREEN,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon3 name="file-contract" size={14} color={GREEN} />
            <Text style={{ fontSize: 13, fontWeight: "800", color: GREEN }}>
              Cancellation Policy
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#374151", lineHeight: 20 }}>
            Free cancellation up to 2 hours before service. Late cancellation may incur a ₹50 fee.
          </Text>
        </View>

        {/* ── CTA ─────────────────────────────────────────── */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={confirming || mutating}
          >
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: confirming || mutating ? "#9CA3AF" : GREEN,
                shadowColor: GREEN,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {confirming ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFF" }}>
                  Confirm Booking · ₹{total.toFixed(0)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: "center", paddingVertical: 12 }}
          >
            <Text style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}>
              ✏️ Add More Services
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Edit item bottom sheet ───────────────────────── */}
      <EditItemSheet
        visible={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        addresses={addresses}
        insets={insets}
        saving={savingItem}
        onSave={handleSaveItemEdit}
        safeAlert={safeAlert}
      />
    </View>
  );
}

// ── Small helpers ────────────────────────────────────────────────
function InfoRow({ icon, color, label, secondary, numberOfLines = 1 }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#F3F8EF",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Icon name={icon} size={14} color={color} />
      <Text
        style={{ fontSize: 13, color: "#1F2937", flex: 1, fontWeight: "600" }}
        numberOfLines={numberOfLines}
      >
        {label}
      </Text>
      {secondary ? (
        <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "700" }}>
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

function Row({ label, value, bold, accent }) {
  return (
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
}