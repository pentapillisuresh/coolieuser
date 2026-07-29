import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { CATEGORIES, BOOKING_FORM_FIELDS } from "../../data/dummy";

const TIMES = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];
const DATES_LABELS = [
  "Today",
  "Tomorrow",
  "Wed 26",
  "Thu 27",
  "Fri 28",
  "Sat 29",
];

export default function BookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('BookingDetailsScreen - All params:', params);
  
  // Extract params with proper type conversion
  const categoryId = params.categoryId?.toString() || '';
  const categoryName = params.categoryName?.toString() || '';
  const serviceId = params.serviceId?.toString() || '';
  const serviceName = params.serviceName?.toString() || 'Service';
  const servicePrice = params.servicePrice?.toString() || '0';
  
  console.log('BookingDetailsScreen - Extracted:', {
    categoryId,
    categoryName,
    serviceId,
    serviceName,
    servicePrice
  });

  // Check if required params are missing
  useEffect(() => {
    if (!categoryId || !serviceId) {
      Alert.alert(
        'Error', 
        'Missing booking information. Please go back and try again.',
        [
          { 
            text: 'Go Back', 
            onPress: () => router.back() 
          }
        ]
      );
    }
  }, [categoryId, serviceId]);

  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const fields = BOOKING_FORM_FIELDS[categoryId] || BOOKING_FORM_FIELDS.default;

  const [formData, setFormData] = useState({});
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState("now");

  const handleNext = () => {
    // Validate required fields
    const requiredFields = fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Required Fields',
        `Please fill in: ${missingFields.map(f => f.label).join(', ')}`
      );
      return;
    }

    console.log('Navigating to summary with:', {
      categoryId,
      categoryName,
      serviceId,
      serviceName,
      servicePrice,
      date: selectedDate,
      time: selectedTime,
      address: formData.address || formData.site_address || formData.station || "42, MG Road, Hyderabad",
    });

    router.push({
      pathname: "/booking/summary",
      params: {
        categoryId,
        categoryName,
        serviceId,
        serviceName,
        servicePrice,
        date: selectedDate,
        time: selectedTime,
        address: formData.address || formData.site_address || formData.station || "42, MG Road, Hyderabad",
        bookingType,
        ...formData,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header - No Gradient */}
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
              {serviceName}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: cat.bg || "#E8F5E9",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#17381B" }}>
              ₹{servicePrice}
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
                {
                  val: "schedule",
                  label: "📅 Schedule Later",
                  sub: "Pick date & time",
                },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setBookingType(opt.val)}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 2,
                    borderColor:
                      bookingType === opt.val ? "#17381B" : "#E5E7EB",
                    backgroundColor:
                      bookingType === opt.val ? "#E8F5E9" : "#F8FAFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color:
                        bookingType === opt.val ? "#17381B" : "#1F2937",
                      marginBottom: 3,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>
                    {opt.sub}
                  </Text>
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Icon2 name="calendar-today" size={18} color="#17381B" />
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}
                >
                  Select Date
                </Text>
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
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor:
                        selectedDate === d ? "#17381B" : "#F3F8EF",
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  marginTop: 16,
                }}
              >
                <Icon name="clock" size={18} color="#17381B" />
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}
                >
                  Select Time
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TIMES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedTime(t)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 12,
                      backgroundColor:
                        selectedTime === t ? "#17381B" : "#F3F8EF",
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
            {fields && fields.length > 0 ? (
              fields.map((field) => (
                <View key={field.id}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#1F2937",
                      }}
                    >
                      {field.label}{" "}
                      {field.required && (
                        <Text style={{ color: "#DC2626" }}>*</Text>
                      )}
                    </Text>
                    {!field.required && (
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
                  <TextInput
                    style={{
                      backgroundColor: "#F3F8EF",
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 14,
                      color: "#1F2937",
                      borderWidth: 1.5,
                      borderColor: formData[field.id] ? "#17381B" : "#E5E7EB",
                      height: field.type === "textarea" ? 90 : 52,
                      textAlignVertical:
                        field.type === "textarea" ? "top" : "center",
                    }}
                    placeholder={
                      field.placeholder || `Enter ${field.label.toLowerCase()}`
                    }
                    placeholderTextColor="#9CA3AF"
                    keyboardType={
                      field.type === "number" ? "number-pad" : "default"
                    }
                    multiline={field.type === "textarea"}
                    value={formData[field.id] || ""}
                    onChangeText={(t) =>
                      setFormData((prev) => ({ ...prev, [field.id]: t }))
                    }
                  />
                </View>
              ))
            ) : (
              <Text style={{ color: "#6B7280" }}>No fields available</Text>
            )}
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
            <Text
              style={{
                fontSize: 13,
                color: "#17381B",
                flex: 1,
                lineHeight: 20,
              }}
            >
              A verified worker will be assigned after you confirm the booking.
              Exact charges may vary based on work scope.
            </Text>
          </View>

          {/* Next - No Gradient */}
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