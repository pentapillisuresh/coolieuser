import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, StatusBar, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { getServiceById } from "../../../services/api/services";

// ─── Static data for date/time selection ────────────────────────
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

    if (i === 0) {
      dates.push("Today");
    } else if (i === 1) {
      dates.push("Tomorrow");
    } else {
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const day = date.getDate();

      dates.push(`${dayName} ${day}`);
    }
  }

  return dates;
};

const DATES_LABELS = getDateLabels();

// ─── Helper to convert date label to actual date string ────────
const getDateString = (label) => {
  const today = new Date();
  if (label === "Today") return today.toISOString().split("T")[0];
  if (label === "Tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }
  // For labels like "Wed 26", we can parse day and month
  const parts = label.split(" ");
  if (parts.length === 2) {
    const day = parseInt(parts[1]);
    const month = today.getMonth();
    const year = today.getFullYear();
    // Assume it's this month (if day < today's day, add month)
    let dateObj = new Date(year, month, day);
    if (dateObj < today) {
      dateObj = new Date(year, month + 1, day);
    }
    return dateObj.toISOString().split("T")[0];
  }
  return today.toISOString().split("T")[0];
};

export default function BookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.categoryId?.toString() || "";
  const categoryName = params.categoryName?.toString() || "";
  const serviceId = params.serviceId?.toString() || "";
  const serviceName = params.serviceName?.toString() || "Service";
  const servicePrice = parseFloat(params.servicePrice?.toString() || "0");

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState("now");
  const [address, setAddress] = useState("");
  
  useEffect(() => {
    if (!serviceId) {
      Alert.alert("Error", "Service ID is missing", [
        { text: "Go Back", onPress: () => router.back() },
      ]);
      return;
    }

    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const response = await getServiceById(parseInt(serviceId));
      console.log("fetched service::", response.data)
      setService(response.data);
    } catch (error) {
      console.error("Failed to fetch service:", error);
      Alert.alert("Error", "Could not load service details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle form field changes ────────────────────────────────
  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...(prev || {}),
      [key]: value,
    }));
  };
  // ─── Build the payload for summary ────────────────────────────
  const handleNext = () => {
    // Validate required fields from service metadata
    const fields = service?.metadata?.formFields || [];
    const requiredFields = fields?.filter((f) => f.required);
    const missingFields = requiredFields.filter((field) => {
      const value = formData?.[field.key];

      if (value === null || value === undefined) {
        return true;
      }

      if (typeof value === "string" && value.trim() === "") {
        return true;
      }

      return false;
    });

    if (missingFields.length > 0) {
      Alert.alert(
        "Required Fields",
        `Please fill in: ${missingFields?.map((f) => f.label).join(", ")}`
      );
      return;
    }


    // Build date/time for API
    const scheduledDate = getDateString(selectedDate);
    const scheduledTime = selectedTime;

    // Build the payload for summary (and eventually booking)
    const payload = {
      categoryId,
      categoryName,
      serviceId,
      serviceName,
      servicePrice,
      scheduledDate,
      scheduledTime,
      address: address.trim(),
      bookingType,
      details: formData, // all dynamic fields
    };
    console.log("rrr::", payload);
    router.push({
      pathname: "/booking/summary",
      params: {
        bookingPayload: JSON.stringify(payload),
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading service details...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <Text style={{ fontSize: 16, color: "#6B7280" }}>Service not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: "#17381B", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fields = service?.metadata?.formFields || [];

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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
              Booking Details
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {service?.name}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#E8F5E9",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#17381B" }}>
              ₹{service?.basePrice}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        >
          {/* Book Type */}
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
                fontSize: 15,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              When do you need the service?
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { val: "now", label: "⚡ Book Now", sub: "Worker in ~30 min" },
                { val: "schedule", label: "📅 Schedule Later", sub: "Pick date & time" },
              ]?.map((opt) => (
                <TouchableOpacity
                  key={opt?.val}
                  onPress={() => setBookingType(opt?.val)}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: bookingType === opt?.val ? "#17381B" : "#E5E7EB",
                    backgroundColor: bookingType === opt?.val ? "#E8F5E9" : "#F8FAFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: bookingType === opt?.val ? "#17381B" : "#1F2937",
                      marginBottom: 3,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>{opt?.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Selection */}
          {bookingType === "schedule" && (
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon2 name="calendar-today" size={18} color="#17381B" />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}>
                  Select Date
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                style={{ flexGrow: 0 }}
              >
                {DATES_LABELS?.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setSelectedDate(d)}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: selectedDate === d ? "#17381B" : "#F3F8EF",
                      borderWidth: selectedDate === d ? 0 : 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: selectedDate === d ? "#FFFFFF" : "#1F2937",
                      }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, marginBottom: 14 }}>
                <Icon name="clock" size={18} color="#17381B" />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}>
                  Select Time
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TIMES?.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedTime(t)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 12,
                      backgroundColor: selectedTime === t ? "#17381B" : "#F3F8EF",
                      borderWidth: selectedTime === t ? 0 : 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: selectedTime === t ? "#FFFFFF" : "#1F2937",
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Dynamic Form Fields */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 16,
              gap: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}>
              Service Information
            </Text>
            {fields?.length > 0 ? (
              fields?.map((field) => {
                const value = formData[field?.key] || "";
                return (
                  <View key={field?.key}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>
                        {field?.label}
                        {field?.required && <Text style={{ color: "#DC2626" }}>*</Text>}
                      </Text>
                      {!field?.required && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#6B7280",
                            backgroundColor: "#F3F4F6",
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          Optional
                        </Text>
                      )}
                    </View>
                    {field?.type === "select" ? (
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
                        {field?.options?.map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            onPress={() => handleFieldChange(field?.key, opt)}
                            style={{
                              paddingVertical: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: "#E5E7EB",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ fontSize: 14, color: "#1F2937" }}>{opt}</Text>
                            {value === opt && (
                              <Icon name="check" size={16} color="#17381B" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : field.type === "boolean" ? (
                      <TouchableOpacity
                        onPress={() => handleFieldChange(field?.key, !value)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          backgroundColor: value ? "#17381B" : "#F3F8EF",
                          borderRadius: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderWidth: 1.5,
                          borderColor: value ? "#17381B" : "#E5E7EB",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: value ? "#FFFFFF" : "#1F2937",
                          }}
                        >
                          {field?.label}
                        </Text>
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: value ? "#FFFFFF" : "#E5E7EB",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {value && <Icon name="check" size={14} color="#17381B" />}
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
                          height: field?.type === "textarea" ? 90 : 52,
                          textAlignVertical: field?.type === "textarea" ? "top" : "center",
                        }}
                        placeholder={field.placeholder || `Enter ${field?.label.toLowerCase()}`}
                        placeholderTextColor="#9CA3AF"
                        keyboardType={field?.type === "number" ? "numeric" : "default"}
                        multiline={field?.type === "textarea"}
                        value={value}
                        onChangeText={(t) => handleFieldChange(field?.key, t)}
                      />
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "#6B7280" }}>No additional information required.</Text>
            )}
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
                Address <Text style={{ color: "#DC2626" }}>*</Text>
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
                borderColor: address ? "#17381B" : "#E5E7EB",
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="Enter your complete address"
              placeholderTextColor="#9CA3AF"
              multiline
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Info note */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              backgroundColor: "#E8F5E9",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "#17381B",
            }}
          >
            <Icon name="info" size={16} color="#17381B" style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 13, color: "#17381B", flex: 1, lineHeight: 20 }}>
              A verified worker will be assigned after you confirm the booking.
              Exact charges may vary based on work scope.
            </Text>
          </View>

          {/* Next button */}
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
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
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
                Continue to Summary
              </Text>
              <Icon name="chevron-right" size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}