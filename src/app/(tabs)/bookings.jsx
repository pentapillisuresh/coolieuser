import { useState, useEffect, useCallback } from "react";
import {View,Text,ScrollView,TouchableOpacity,StatusBar,Alert,RefreshControl,ActivityIndicator,Linking} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {Star,MapPin,Calendar,RotateCcw,FileText,ChevronRight,Phone,Clock,CheckCircle,XCircle,AlertCircle,X} from "lucide-react-native";
import { getMyBookings, cancelBooking } from "../../../services/api/booking";

const TABS = ["Active", "Upcoming", "Completed", "Cancelled"];

// Map booking status to tab filter
const statusMap = {
  Active: ["accepted", "in-progress"],
  Upcoming: ["pending"],
  Completed: ["completed", "payment-pending"],
  Cancelled: ["cancelled"],
};

const STATUS_CONFIG= {
  pending: {
    label: "Pending",
    color: "#2563EB",
    bg: "#DBEAFE",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "#16A34A",
    bg: "#DCFCE7",
    icon: CheckCircle,
  },
  "in-progress": {
    label: "In Progress",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "#6B7280",
    bg: "#F3F4F6",
    icon: CheckCircle,
  },
  "payment-pending": {
    label: "Payment Pending",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: XCircle,
  },
};

const PAYMENT_CONFIG = {
  paid: { label: "Paid", color: "#16A34A", bg: "#DCFCE7" },
  pending: { label: "Pending", color: "#D97706", bg: "#FEF3C7" },
  refunded: { label: "Refunded", color: "#6B7280", bg: "#F3F4F6" },
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Active");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchBookings = useCallback(
    async (reset = false) => {
      if (loading) return;
      if (!reset && !hasMore) return;

      setLoading(true);
      try {
        const statuses = statusMap[activeTab] || [];
        const status = statuses.length === 1 ? statuses[0] : undefined;
        const response = await getMyBookings({
          page: reset ? 1 : page,
          limit,
          status,
        });
        const newItems = response.data.items || [];

        const total = response.data.totalItems || 0;
        setTotalItems(total);
        if (reset) {
          setBookings(newItems);
        } else {
          setBookings((prev) => [...prev, ...newItems]);
        }
        setHasMore(newItems.length === limit && page * limit < total);
        if (reset) setPage(1);
        else setPage((p) => p + 1);
      } catch (error) {
        console.error("Fetch bookings error:", error);
        Alert.alert("Error", "Failed to load bookings");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, page, hasMore, loading]
  );

  useEffect(() => {
    // Reset and fetch on tab change
    setPage(1);
    setHasMore(true);
    setBookings([]);
    fetchBookings(true);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchBookings(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBookings(false);
    }
  };

  const handleCancel = async (bookingId, serviceName) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel "${serviceName}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(bookingId, "User requested cancellation");
              Alert.alert("Success", "Booking cancelled successfully!");
              // Refresh list
              onRefresh();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const BookingCard = ({ booking, onCancel }) => {
    const status = booking.status;
    const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const payConf = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.pending;
    const StatusIcon = statusConf.icon || AlertCircle;
    const worker = booking.Job?.Worker;
    const workerUser = worker?.User;
    const workerPhone = workerUser?.mobile;

    const handleCall = () => {
      if (workerPhone) {
        Linking.openURL(`tel:${workerPhone}`);
      } else {
        Alert.alert("No phone number available");
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/booking/accepted",
            params: { bookingId: booking.id.toString() },
          })
        }
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          marginHorizontal: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
          overflow: "hidden",
        }}
      >
        <View style={{ padding: 16 }}>
          {/* Row 1: Service + Status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#1F2937",
                  marginBottom: 2,
                }}
              >
                {booking.Service?.name || "Service"}
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                {booking.Service?.Category?.name || "Category"} • #{booking.id}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: statusConf.bg,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginLeft: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <StatusIcon size={12} color={statusConf.color} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: statusConf.color,
                }}
              >
                {statusConf.label}
              </Text>
            </View>
          </View>

          {/* Worker Section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              backgroundColor: "#F3F8EF",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#17381B",
              }}
            >
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1F2937" }}
              >
                {workerUser?.name || "Worker"}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {worker?.rating || 4.8} • {worker?.isVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>
            {workerPhone && (
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  backgroundColor: "#17381B",
                  borderRadius: 50,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Phone size={14} color="#FFFFFF" />
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}
                >
                  CALL
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Date + Address */}
          <View style={{ gap: 8, marginBottom: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Calendar size={16} color="#17381B" />
              <Text style={{ fontSize: 13, color: "#374151", fontWeight: "500" }}>
                {booking.scheduledDate || "N/A"} at {booking.scheduledTime?.slice(0, 5) || "N/A"}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <MapPin size={16} color="#17381B" />
              <Text
                style={{ fontSize: 13, color: "#6B7280", flex: 1 }}
                numberOfLines={1}
              >
                {booking.address || "No address"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: "#E8F5E9",
              marginBottom: 12,
              marginHorizontal: 0,
            }}
          />

          {/* Amount + Actions */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#17381B",
                }}
              >
                ₹{booking.totalAmount || 0}
              </Text>
              <View
                style={{
                  backgroundColor: payConf.bg || "#F3F4F6",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  marginTop: 2,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: payConf.color || "#6B7280",
                  }}
                >
                  {payConf.label}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {["completed", "payment-pending"].includes(status) && (
                <>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/booking/invoice",
                        params: {
                          bookingId: booking.id.toString(),
                          amount: booking.totalAmount?.toString(),
                        },
                      })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#F3F8EF",
                      borderRadius: 50,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: "#17381B",
                    }}
                  >
                    <FileText size={16} color="#17381B" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#17381B",
                      }}
                    >
                      Invoice
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#17381B",
                      borderRadius: 50,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}
                  >
                    <RotateCcw size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      Rebook
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {["pending", "accepted"].includes(status) && (
                <>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/booking/accepted",
                        params: { bookingId: booking.id.toString() },
                      })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#17381B",
                      borderRadius: 50,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      View Booking
                    </Text>
                    <ChevronRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCancel(booking.id, booking.Service?.name || "Service")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#DC2626",
                      borderRadius: 50,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}
                  >
                    <X size={16} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {status === "cancelled" && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#17381B",
                    borderRadius: 50,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <RotateCcw size={16} color="#FFFFFF" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Rebook
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredBookings = bookings; // Already filtered by API

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <View
        style={{
          backgroundColor: "#17381B",
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 16,
            letterSpacing: 0.5,
          }}
        >
          My Bookings
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {TABS.map((tab) => {
            const active = tab === activeTab;
            // Count from totalItems or bookings length
            const count = activeTab === tab ? totalItems : 0;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 30,
                  backgroundColor: active
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.2)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: active ? "#17381B" : "#FFFFFF",
                  }}
                >
                  {tab}
                </Text>
                {count > 0 && (
                  <View
                    style={{
                      backgroundColor: active
                        ? "#2ECC71"
                        : "rgba(255,255,255,0.3)",
                      borderRadius: 12,
                      minWidth: 22,
                      height: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: active ? "#FFFFFF" : "#FFFFFF",
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEnd = layoutMeasurement + contentOffset.y >= contentSize.height - 20;
          if (isEnd) loadMore();
        }}
        scrollEventThrottle={16}
      >
        {loading && bookings.length === 0 ? (
          <ActivityIndicator size="large" color="#17381B" style={{ marginTop: 40 }} />
        ) : filteredBookings.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingTop: 60,
              paddingHorizontal: 40,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 2,
                borderColor: "#17381B",
              }}
            >
              <Text style={{ fontSize: 48 }}>📋</Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No {activeTab} Bookings
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              You don't have any {activeTab.toLowerCase()} bookings yet. Book a
              service to get started!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/booking/categories")}
              style={{
                backgroundColor: "#17381B",
                borderRadius: 50,
                paddingHorizontal: 32,
                paddingVertical: 14,
                shadowColor: "#17381B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}
              >
                Book a Service
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
            {loading && bookings.length > 0 && (
              <ActivityIndicator size="small" color="#17381B" style={{ marginVertical: 16 }} />
            )}
            {!hasMore && bookings.length > 0 && (
              <Text style={{ textAlign: "center", color: "#9CA3AF", marginVertical: 12 }}>
                No more bookings
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}