import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { SERVICES, CATEGORIES } from "../../data/dummy";
import { getCategoryById } from "../../../services/api/categories";
import { getServicesByCategory } from "../../../services/api/services";

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract params with proper error handling
  const categoryId = params.categoryId?.toString() || '';
  const categoryName = params.categoryName?.toString() || '';

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      Alert.alert("Error", "Category ID is missing");
      router.back();
      return;
    }
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch category details (for image, name, etc.)
      let catData = null;
      let serviceData = [];
      try {
        const catResponse = await getCategoryById(parseInt(categoryId));

        catData = catResponse?.data || {};
        serviceData = catResponse?.data.Services || [];
      } catch (err) {
        // Fallback if category fetch fails
        console.log("cat err::", err)
        catData = {
          id: parseInt(categoryId),
          name: categoryName,
          image: null,
        };
      }
      setCategory(catData || {});

      setServices(serviceData || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      Alert.alert("Error", "Could not load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // const cat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  // const services = SERVICES[categoryId] || SERVICES.electrician;

  const handleSelectService = (svc) => {

    // Using query params instead of params for better compatibility
    router.push({
      pathname: "booking/details",
      params: {
        categoryId: category?.id,
        categoryName: category?.name,
        serviceId: svc?.id,
        serviceName: svc?.name,
        servicePrice: svc?.price.toString(),
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
          paddingBottom: 30,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
          }}
        >
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
              fontSize: 20,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            {category?.name}
          </Text>
        </View>

        {/* Category card */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{
                uri: `${category?.image}`,
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
              }}
            />
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              {category?.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              {services?.length} services available
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#9CA3AF",
            letterSpacing: 1,
            marginLeft: 4,
            marginBottom: 4,
          }}
        >
          SELECT A SERVICE
        </Text>
        {services?.map((svc) => ( 
          <TouchableOpacity
            key={svc?.id}
            onPress={() => {
              // router.push({
              //   pathname: "booking/details",
              //   params: {
              //     categoryId: category?.id,
              //     categoryName: category?.name,
              //     serviceId: svc?.id,
              //     serviceName: svc?.name,
              //     servicePrice: svc?.price.toString(),
              //   }
              // }) 
            }}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
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
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              {/* Emoji icon */}
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
                <Image
                  source={{
                    uri: `${svc?.image}`,
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#1F2937",
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {svc?.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "900",
                      color: "#17381B",
                    }}
                  >
                    ₹{svc?.basePrice}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    lineHeight: 20,
                    marginBottom: 10,
                  }}
                >
                  {svc?.description}
                </Text>

                {/* Meta row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon2 name="star" size={13} color="#F59E0B" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#1F2937",
                      }}
                    >
                      {svc?.rating}
                    </Text>
                  </View> */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon2 name="access-time" size={14} color="#6B7280" />
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      {svc?.duration}
                    </Text>
                  </View>
                  {/* <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon3 name="users" size={13} color="#6B7280" />
                    <Text style={{ fontSize: 12, color: "#6B7280" }}>
                      {(svc?.bookings / 1000).toFixed(1)}k booked
                    </Text>
                  </View> */}
                </View>
              </View>
            </View>

            {/* Book button - No Gradient */}
            <TouchableOpacity
              onPress={() => { 
                console.log("services::::",svc?.basePrice)
                router.push({
                  pathname: "/booking/details",
                  params: {
                    categoryId: String(category?.id ?? ""),
                    categoryName: category?.name ?? "",
                    serviceId: String(svc?.id ?? ""),
                    serviceName: svc?.name ?? "",
                    servicePrice: String(svc?.basePrice ?? ""),
                  },
                })
               }
              }
              style={{
                marginTop: 14,
                backgroundColor: "#17381B",
                borderRadius: 50,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}
              >
                Book Now
              </Text>
              <Icon name="chevron-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}