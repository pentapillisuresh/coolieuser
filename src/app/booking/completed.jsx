import React, { useState, useEffect } from "react";
import {View,Text,TouchableOpacity,Alert,StatusBar,ActivityIndicator,ScrollView} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import {getJobById} from "../../../services/api/job";

export default function CompletedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [job, setJob] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const jobId = params?.jobId;

  // ─── Load job on mount ────────────────────────────────────
  useEffect(() => {
    if (jobId) {
      loadJob();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await getJobById(jobId);
      const jobData = response?.data || response;

      if (!jobData) {
        Alert.alert("Error", "Job not found.");
        router.back();
        return;
      }

      setJob(jobData);

      // ✅ Extract worker from job.Worker (with User nested inside)
      const workerData = jobData.Worker || {};
      const workerUser = workerData.User || {};
      setWorker({
        id: workerData.id,
        name: workerUser.name || "Worker",
        mobile: workerUser.mobile || "",
        profession: workerData.profession || "Service Professional",
        rating: workerData.rating || 0,
        experience: workerData.experience || 0,
        isVerified: workerData.isVerified || false,
      });

      // Redirect if job isn't actually completed
      const status = String(jobData.status || "").toLowerCase();
      if (status !== "completed") {
        console.warn("Job not completed yet. Status:", status);
        // Uncomment if you want to redirect
        // router.replace({
        //   pathname: "/job/details",
        //   params: { id: jobId },
        // });
      }
    } catch (error) {
      console.error("Failed to load job:", error);
      Alert.alert("Error", "Unable to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Confirm completion → go to payment ──────────────────
  const handleConfirm = () => {
    router.push({
      pathname: "/(tabs)/home",
    });
  };

  // ─── Raise an issue ───────────────────────────────────────
  const handleRaiseIssue = () => {
    Alert.alert(
      "Raise an Issue",
      "Our support team will contact you within 2 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () =>
            router.push({
              pathname: "/support",
              params: { jobId, bookingId: job?.bookingId },
            }),
        },
      ]
    );
  };

  // ─── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F8EF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading job details...
        </Text>
      </View>
    );
  }

  // ─── Not found state ─────────────────────────────────────
  if (!job) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F8EF",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: "#6B7280" }}>
          Job not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Extract display data ─────────────────────────────────
  const booking = job.Booking || {};
  const service = booking.Service || {};
  const category = service.Category || {};

  const serviceName =
    params.serviceName ||
    service.name ||
    booking.details?.serviceName ||
    "Service";

  const workerName = worker?.name || "Worker";
  const workerInitial = workerName.charAt(0).toUpperCase();

  const totalAmount = parseFloat(booking.totalAmount || 0);
  const completedAt = job.completedAt
    ? new Date(job.completedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Just now";

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
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          Work Completed!
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          {serviceName}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Completion banner */}
        <View
          style={{
            backgroundColor: "#DCFCE7",
            borderRadius: 22,
            padding: 24,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: "#86EFAC",
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "#16A34A",
            }}
          >
            <Icon2 name="check-circle" size={50} color="#16A34A" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: "#166534",
              textAlign: "center",
            }}
          >
            Work Completed! 🎉
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#15803d",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            {workerName} has marked the job as complete. Please confirm if
            you're satisfied.
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#15803d",
              marginTop: 6,
            }}
          >
            {completedAt}
          </Text>
        </View>

        {/* Worker summary */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
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
            <Text style={{ fontSize: 28, color: "#FFFFFF" }}>
              {workerInitial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}>
              {workerName}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              {serviceName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 3,
              }}
            >
              <Icon name="check-circle" size={12} color="#16A34A" />
              <Text
                style={{
                  fontSize: 12,
                  color: "#16A34A",
                  fontWeight: "600",
                }}
              >
                Job Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Booking summary */}
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
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 12,
            }}
          >
            Service Summary
          </Text>

          {[
            {
              label: "Category",
              value: category.name || "Service",
            },
            {
              label: "Service",
              value: serviceName,
            },
            {
              label: "Date",
              value: booking.scheduledDate || "—",
            },
            {
              label: "Time",
              value: booking.scheduledTime?.slice(0, 5) || "—",
            },
            {
              label: "Address",
              value: booking.address || "—",
            },
          ].map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: i < 4 ? 1 : 0,
                borderBottomColor: "#F3F8EF",
              }}
            >
              <Text style={{ fontSize: 13, color: "#6B7280", flex: 1 }}>
                {row.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#1F2937",
                  flex: 2,
                  textAlign: "right",
                }}
                numberOfLines={2}
              >
                {row.value}
              </Text>
            </View>
          ))}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 12,
              marginTop: 4,
              borderTopWidth: 2,
              borderTopColor: "#17381B",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "900", color: "#1F2937" }}>
              Total Amount
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#17381B" }}>
              ₹{totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: "#E8F5E9",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="info" size={16} color="#17381B" />
            <Text
              style={{
                fontSize: 14,
                color: "#17381B",
                lineHeight: 22,
                flex: 1,
              }}
            >
              Please verify that all work has been completed to your
              satisfaction before confirming.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#16A34A",
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Icon2 name="check-circle" size={20} color="#FFFFFF" />
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}
              >
                Confirm Completion
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRaiseIssue}
            style={{
              borderRadius: 50,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 2,
              borderColor: "#DC2626",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Icon3 name="exclamation-triangle" size={20} color="#DC2626" />
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: "#DC2626" }}
            >
              Raise an Issue
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}