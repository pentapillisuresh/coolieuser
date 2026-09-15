import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator, Linking, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import MapView, { Marker } from "react-native-maps";
import { getBookingById } from "../../../services/api/booking";
import { arriveAtJob } from "../../../services/api/job";
import { socketService } from "../../../services/websocket/socket";
import { getCurrentLocation } from "../../utils/liveLocation";

// ─── Progress Steps based on Job status ──────────────────────────
const STATUS_STEPS = [
  { key: "assigned", label: "Worker Assigned" },
  { key: "accepted", label: "Worker Accepted" },
  { key: "arrived", label: "Worker Arrived" },
  { key: "in-progress", label: "Work Started" },
  { key: "completed", label: "Completed" },
];

const getStatusIndex = (status) => {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  assigned: { label: "Worker Assigned", color: "#2563EB", bg: "#DBEAFE" },
  accepted: { label: "Worker Accepted", color: "#16A34A", bg: "#DCFCE7" },
  arrived: { label: "Worker Arrived", color: "#D97706", bg: "#FEF3C7" },
  "in-progress": { label: "Work In Progress", color: "#D97706", bg: "#FEF3C7" },
  completed: { label: "Completed", color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2" },
};

export default function AcceptedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId?.toString() || "";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arriving, setArriving] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const mapRef = useRef < MapView > (null);

  // ─── Fetch booking ─────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await getBookingById(Number(bookingId));
      setBooking(response.data);
      // Get initial user location
      const loc = await getCurrentLocation();
      if (loc) setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      Alert.alert("Error", "Could not load booking details.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Socket integration ────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    socketService.connect();
    socketService.joinBooking(Number(bookingId));

    // Listen for worker location updates
    const unsubLocation = socketService.on("worker-location", (data) => {
      if (data.bookingId === Number(bookingId)) {
        setWorkerLocation({ latitude: data.latitude, longitude: data.longitude });
        // Optionally animate map to worker
        mapRef.current?.animateToRegion(
          {
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    });

    // Listen for job status updates
    const unsubStatus = socketService.on("job-status-update", (data) => {
      if (data.bookingId === Number(bookingId)) {
        fetchBooking(); // Refresh booking details
      }
    });

    // Listen for chat messages
    const unsubChat = socketService.on("chat-message", (data) => {
      if (data.bookingId === Number(bookingId)) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      unsubLocation();
      unsubStatus();
      unsubChat();
      socketService.leaveBooking(Number(bookingId));
    };
  }, [bookingId]);

  // ─── Send chat message ─────────────────────────────────────────
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const msg = {
      bookingId: Number(bookingId),
      message: messageText.trim(),
      senderId: booking?.userId,
      senderType: "user",
      timestamp: new Date().toISOString(),
    };
    console.log("chat message::", msg)
    socketService.emit("chat-message", msg);
    setMessages((prev) => [...prev, msg]);
    setMessageText("");
  };

  // ─── Handle Worker Arrived ─────────────────────────────────────
  const handleWorkerArrived = async () => {
    if (!booking?.Job?.id) {
      Alert.alert("Error", "Job not found for this booking.");
      return;
    }
    setArriving(true);
    try {
      const loc = await getCurrentLocation();
      const jobUpdate = await arriveAtJob(
        booking.Job.id,
        loc?.latitude || booking.latitude,
        loc?.longitude || booking.longitude
      );
      console.log("jobUpdate::", jobUpdate.data)
      if (jobUpdate.success) {
        router.push({
          pathname: "/booking/arrived",
          params: { jobData: JSON.stringify(jobUpdate.data) },
        });
      }
      fetchBooking();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update job status.");
    } finally {
      setArriving(false);
    }
  };

  const handleContinue = async () => {

    switch (jobStatus) {
      case "arrived":
        console.log("booking::",booking)
        router.push({
          pathname: "/booking/arrived",
          params: { jobData: JSON.stringify(booking.Job) },
        });
        break;
    
      case "in-progress":
        router.push({
          pathname: "/booking/in-progress",
          params: { jobData: JSON.stringify(booking) },
        });
        break;
    
      case "completed":
        router.push({
          pathname: "/booking/completed",
          params: { jobData: JSON.stringify(booking) },
        });
        break;
    
      default:
        break;
    }

  };

  // ─── Handle Call ───────────────────────────────────────────────
  const handleCall = () => {
    const phone = booking?.Job?.Worker?.User?.mobile;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("No phone number available");
  };

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading booking...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <Text style={{ color: "#6B7280" }}>Booking not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const worker = booking.Job?.Worker;
  const workerUser = worker?.User;
  const jobStatus = booking.Job?.status || "assigned";
  const statusConf = STATUS_CONFIG[jobStatus] || STATUS_CONFIG.assigned;
  const currentStepIdx = getStatusIndex(jobStatus);

  // Show map only when within 20 min of scheduled time and same date
  const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
  const now = new Date();
  const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / 60000;
  const sameDay = now.toDateString() === scheduledDateTime.toDateString();
  const showMap = sameDay && diffMinutes <= 20 && diffMinutes >= -30 && !!workerLocation;

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 }}>
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
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", flex: 1 }}>
            Booking #{booking.id}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: statusConf.bg,
            borderRadius: 12,
            padding: 10,
            alignSelf: "flex-start",
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusConf.color }} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: statusConf.color }}>
            {statusConf.label}
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
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: "#17381B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 32, color: "#FFFFFF" }}>
                  {workerUser?.name?.charAt(0) || "W"}
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
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}>
                {workerUser?.name || "Worker"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                <Icon2 name="star" size={13} color="#F59E0B" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>
                  {worker?.rating || 4.8}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  · {worker?.experience || 0} yrs
                </Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={handleCall}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#DCFCE7",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon name="phone" size={18} color="#16A34A" />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#16A34A" }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowChat(true)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#E8F5E9",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon name="message-square" size={18} color="#17381B" />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#17381B" }}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!workerLocation) {
                  Alert.alert("Tracking", "Waiting for worker location...");
                  return;
                }
                // Focus map or scroll to map
              }}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#EDE9FE",
                borderRadius: 50,
                paddingVertical: 13,
              }}
            >
              <Icon3 name="map-marked-alt" size={18} color="#7C3AED" />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#7C3AED" }}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Tracking Map */}
        {showMap && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1F2937", margin: 8 }}>
              Live Worker Location
            </Text>
            <MapView
              ref={mapRef}
              style={{ width: "100%", height: 220, borderRadius: 16 }}
              initialRegion={{
                latitude: userLocation?.latitude || 17.6935526,
                longitude: userLocation?.longitude || 83.2921297,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="You"
                  pinColor="#17381B"
                />
              )}
              {workerLocation && (
                <Marker
                  coordinate={workerLocation}
                  title={workerUser?.name || "Worker"}
                  pinColor="#2ECC71"
                />
              )}
            </MapView>
          </View>
        )}

        {/* Progress Steps */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 16 }}>
            Booking Progress
          </Text>
          {STATUS_STEPS.map((step, i) => {
            const done = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <View key={step.key} style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: done ? "#16A34A" : active ? "#17381B" : "#F3F8EF",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: active ? 2 : 0,
                      borderColor: active ? "#2ECC71" : "transparent",
                    }}
                  >
                    {done ? (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    ) : active ? (
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" }} />
                    ) : (
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#D1D5DB" }} />
                    )}
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View
                      style={{
                        width: 2,
                        height: 28,
                        backgroundColor: done ? "#16A34A" : "#E5E7EB",
                        marginTop: 2,
                        marginBottom: 2,
                      }}
                    />
                  )}
                </View>
                <View style={{ paddingTop: 6, flex: 1, paddingBottom: i < STATUS_STEPS.length - 1 ? 16 : 0 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: active || done ? "700" : "500",
                      color: done ? "#1F2937" : active ? "#17381B" : "#9CA3AF",
                    }}
                  >
                    {step.label}
                  </Text>
                  {active && (
                    <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Current stage</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Booking Details */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            gap: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
            Booking Details
          </Text>
          {[
            { icon: "map-pin", text: booking.address, color: "#DC2626" },
            { icon: "calendar", text: booking.scheduledDate, color: "#2563EB" },
            { icon: "clock", text: booking.scheduledTime?.slice(0, 5), color: "#16A34A" },
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
              <Text style={{ fontSize: 14, color: "#1F2937", flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Worker Arrived Button */}
        {jobStatus !== "arrived" && jobStatus !== "in-progress" && jobStatus !== "completed" ? (
          <TouchableOpacity onPress={handleWorkerArrived} disabled={arriving} activeOpacity={0.85}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: arriving ? "#9CA3AF" : "#17381B",
                shadowColor: "#17381B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                {arriving ? "Updating..." : "Worker Arrived? →"}
              </Text>
            </View>
          </TouchableOpacity>
        ):(
          <TouchableOpacity onPress={handleContinue} disabled={arriving} activeOpacity={0.85}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: arriving ? "#9CA3AF" : "#17381B",
                shadowColor: "#17381B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                Continue →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 16,
              height: "75%",
            }}
          >
            {/* Chat header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
                Chat with {workerUser?.name || "Worker"}
              </Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Icon name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              keyExtractor={(_, idx) => idx.toString()}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    alignSelf: item.senderType === "user" ? "flex-end" : "flex-start",
                    backgroundColor: item.senderType === "user" ? "#17381B" : "#F3F8EF",
                    padding: 10,
                    borderRadius: 12,
                    marginVertical: 4,
                    maxWidth: "80%",
                  }}
                >
                  <Text
                    style={{
                      color: item.senderType === "user" ? "#FFFFFF" : "#1F2937",
                      fontSize: 14,
                    }}
                  >
                    {item.message}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 24 }}>
                  No messages yet. Start the conversation!
                </Text>
              }
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                borderTopWidth: 1,
                borderTopColor: "#F3F8EF",
                paddingTop: 12,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#F3F8EF",
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14,
                }}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  backgroundColor: "#17381B",
                  borderRadius: 24,
                  padding: 12,
                }}
              >
                <Icon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}