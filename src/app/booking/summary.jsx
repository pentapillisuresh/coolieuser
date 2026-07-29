import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { CATEGORIES, getPriceBreakdown } from "../../data/dummy";

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('BookingSummary - Received params:', params);
  
  const {
    categoryId,
    categoryName,
    serviceName,
    servicePrice,
    date,
    time,
    address,
  } = params;
  
  const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const price = parseInt(servicePrice) || 200;
  const breakdown = getPriceBreakdown(price);

  const handleConfirm = () => {
    // Create a clean params object with all required data
    const bookingParams = {
      categoryId: categoryId || '',
      categoryName: categoryName || '',
      serviceName: serviceName || '',
      servicePrice: servicePrice || '0',
      date: date || 'Today',
      time: time || '10:00 AM',
      address: address || '42, MG Road, Hyderabad',
    };
    
    console.log('Attempting to navigate to workers with params:', bookingParams);
    
    // Try multiple navigation methods
    try {
      // Method 1: Using push with pathname
      router.push({
        pathname: "/booking/workers",
        params: bookingParams
      });
    } catch (error1) {
      console.log('Method 1 failed:', error1);
      try {
        // Method 2: Using navigate
        router.navigate({
          pathname: "/booking/workers",
          params: bookingParams
        });
      } catch (error2) {
        console.log('Method 2 failed:', error2);
        try {
          // Method 3: Using replace
          router.replace({
            pathname: "/booking/workers",
            params: bookingParams
          });
        } catch (error3) {
          console.log('Method 3 failed:', error3);
          // Method 4: Using href string
          const queryString = Object.keys(bookingParams)
            .map(key => `${key}=${encodeURIComponent(bookingParams[key])}`)
            .join('&');
          router.push(`/booking/workers?${queryString}`);
        }
      }
    }
  };

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
                backgroundColor: cat.bg || "#E8F5E9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28 }}>{cat.emoji || "📋"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}
              >
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
              <Text
                style={{ fontSize: 14, color: "#1F2937", flex: 1 }}
                numberOfLines={1}
              >
                {address || "42, MG Road, Hyderabad"}
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
                <Text
                  style={{
                    fontSize: 13,
                    color: "#1F2937",
                    fontWeight: "600",
                  }}
                >
                  {date || "Today"}
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
                <Text
                  style={{
                    fontSize: 13,
                    color: "#1F2937",
                    fontWeight: "600",
                  }}
                >
                  {time || "10:00 AM"}
                </Text>
              </View>
            </View>
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            Price Breakdown
          </Text>
          <Row label="Base Service Charge" value={`₹${breakdown.base}`} />
          <Row label="Platform Fee (5%)" value={`₹${breakdown.platform_fee}`} />
          <Row label="GST (18%)" value={`₹${breakdown.gst}`} />
          <Row
            label="Discount (KOOLI50)"
            value={`-₹${breakdown.discount}`}
            accent={true}
          />
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
            <Text
              style={{ fontSize: 18, fontWeight: "900", color: "#1F2937" }}
            >
              Total Amount
            </Text>
            <Text
              style={{ fontSize: 22, fontWeight: "900", color: "#17381B" }}
            >
              ₹{breakdown.total}
            </Text>
          </View>
        </View>

        {/* Promo Code */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="tag" size={20} color="#17381B" />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: "700",
              color: "#17381B",
            }}
          >
            KOOLI50 applied · ₹50 saved!
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280" }}>Change</Text>
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
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: "#17381B",
                marginBottom: 4,
              }}
            >
              Cancellation Policy
            </Text>
          </View>
          <Text
            style={{ fontSize: 12, color: "#374151", lineHeight: 20 }}
          >
            Free cancellation up to 2 hours before service. Late cancellation
            may incur a ₹50 fee.
          </Text>
        </View>

        {/* CTA */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
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
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}
              >
                Select Worker →
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: "center", paddingVertical: 12 }}
          >
            <Text
              style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}
            >
              ✏️ Edit Details
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}