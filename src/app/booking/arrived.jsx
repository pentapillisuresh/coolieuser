import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { getBookingById } from "../../../services/api/booking";

export default function ArrivedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [jobData, setJobData] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Parse job data ─────────────────────────────────────────
  useEffect(() => {
    if (!params.jobData) {
      Alert.alert("Error", "Job data missing");
      router.back();
      return;
    }

    try {
      const parsed = JSON.parse(params.jobData);
      setJobData(parsed);

      // Try to fetch full booking for worker details (optional)
      if (parsed.bookingId) {
        fetchWorkerDetails(parsed.bookingId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Parse error:", err);
      Alert.alert("Error", "Invalid job data");
      router.back();
    }
  }, [params.jobData]);

  const fetchWorkerDetails = async (bookingId) => {
    try {
      const res = await getBookingById(bookingId);
      const booking = res.data;

      if (booking?.Job?.Worker?.User) {
        setWorker({
          name: booking.Job.Worker.User.name || "Worker",
          mobile: booking.Job.Worker.User.mobile,
          rating: booking.Job.Worker.rating || 4.8,
          isVerified: booking.Job.Worker.isVerified,
        });
      }
    } catch (err) {
      console.warn("Failed to fetch worker details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (!jobData?.confirmationOtp) {
      Alert.alert(
        "OTP Not Ready",
        "The OTP will appear once the worker is ready to start. Please wait."
      );
      return;
    }
    router.push({
      pathname: "/booking/in-progress",
      params: { jobId: String(jobData.id) },
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F8EF",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading worker details...
        </Text>
      </View>
    );
  }

  const workerName = worker?.name || "Your Worker";
  const workerInitial = workerName.charAt(0).toUpperCase();
  const otpValue = jobData?.confirmationOtp;
  const isOtpReady = !!otpValue;

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
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            Worker Arrived!
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Arrived icon */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            shadowColor: "#16A34A",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Icon2 name="home" size={48} color="#16A34A" />
        </View>

        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#1F2937",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Worker Has Arrived!
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          {workerName} is at your location.{"\n"}Share the OTP to start the service.
        </Text>

        {/* Worker info */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 28, color: "#FFFFFF" }}>{workerInitial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "900", color: "#1F2937" }}>
              {workerName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 3,
              }}
            >
              <Icon2 name="star" size={13} color="#F59E0B" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>
                {worker?.rating || 4.8}
              </Text>
              {worker?.isVerified && (
                <>
                  <Icon2 name="verified" size={13} color="#16A34A" />
                  <Text style={{ fontSize: 12, color: "#16A34A" }}>Verified</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* OTP Section */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 2,
            borderColor: isOtpReady ? "#17381B" : "#D1D5DB",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Icon2
              name={isOtpReady ? "qr-code" : "hourglass-empty"}
              size={20}
              color={isOtpReady ? "#17381B" : "#6B7280"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: isOtpReady ? "#17381B" : "#6B7280",
              }}
            >
              {isOtpReady ? "Your Service OTP" : "Waiting for OTP"}
            </Text>
          </View>

          {isOtpReady ? (
            <>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: "#17381B",
                  letterSpacing: 12,
                  marginBottom: 8,
                }}
              >
                {otpValue}
              </Text>
              <Text
                style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}
              >
                Share this OTP with the worker to start service. Valid for this
                session only.
              </Text>
            </>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginVertical: 12,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 10,
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: "#D1D5DB",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24, color: "#D1D5DB" }}>—</Text>
                  </View>
                ))}
              </View>
              <Text
                style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}
              >
                The OTP will appear once the worker is ready to begin. Please wait.
              </Text>
            </>
          )}
        </View>

        {/* Verify OTP Button */}
        <TouchableOpacity
          onPress={handleVerifyOTP}
          disabled={!isOtpReady}
          activeOpacity={0.85}
          style={{ width: "100%" }}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isOtpReady ? "#17381B" : "#9CA3AF",
              shadowColor: "#17381B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              {isOtpReady ? "Start Work" : "Waiting for OTP..."}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Job ID hint */}
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 16 }}>
          Job #{jobData?.id} · Booking #{jobData?.bookingId}
        </Text>
      </View>
    </View>
  );
}