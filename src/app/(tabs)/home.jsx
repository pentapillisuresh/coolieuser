import { useState, useRef, useEffect, useCallback } from "react";
import { View, FlatList, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, ImageBackground, Image, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Bell, MapPin, Star, ChevronRight, Wallet, Shield, Clock, CreditCard, Headphones } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {COLORS,CATEGORIES,POPULAR_SERVICES,MY_BOOKINGS,NOTIFICATIONS} from "../../data/dummy";
import * as SecureStore from 'expo-secure-store';
import { getCurrentLocation } from '../../utils/liveLocation'
import { getActivePromotions } from '../../../services/api/promotions'
import { getCategories } from '../../../services/api/categories'
import { getMyBookings } from '../../../services/api/booking'
import { getTopServices } from '../../../services/api/services'
import promotionImage from '../../../assets/images/homepercentage.png'
import { getUser } from "../../utils/storage";
const { width } = Dimensions.get("window");

// ─── Emoji mapping ──────────────────────────────────────────────
const categoryEmojiMap = {
  Venus: "💆‍♀️",
  Mars: "💇‍♂️",
  Wrench: "🔧",
  Sparkles: "✨",
  Hammer: "🔨",
  PaintRoller: "🎨",
  TrainFront: "🚆",
  Package: "📦",
  Construction: "🏗️",
  Truck: "🚚",
  Droplet: "💧",
  Sprout: "🌱",
  Tractor: "🚜",
};

// ─── Color palette (pastel) ─────────────────────────────────────
const pastelColors = [
  "#E8F5E9", // green
  "#FFF3E0", // orange
  "#E3F2FD", // blue
  "#F3E5F5", // purple
  "#FBE9E7", // red
  "#E0F7FA", // cyan
  "#FFF8E1", // yellow
  "#F1F8E9", // light green
  "#FCE4EC", // pink
  "#E8EAF6", // indigo
  "#F5F5F5", // grey
  "#E0F2F1", // teal
];

const getCategoryColor = (id) => {
  return pastelColors[id % pastelColors.length] || "#E8F5E9";
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [category, setCategory] = useState([])
  const [booking, setBooking] = useState([])
  const [topServices, setTopServices] = useState([])
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(()=>{
    getUserDetails();
  })

  const getUserDetails=async ()=>{
const userDetails=await getUser();
}

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning 👋";
    } else if (hour < 17) {
      return "Good Afternoon ☀️";
    } else if (hour < 21) {
      return "Good Evening 🌇";
    } else {
      return "Good Night 🌙";
    }
  };

  const EmptyComponent = useCallback(() => (
    <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
      <TouchableOpacity activeOpacity={0.9}>
        <Image
          source={promotionImage} // ✅ Direct usage – no require wrapper
          style={{
            width: width - 40,
            height: 180,
            borderRadius: 16,
            resizeMode: "cover",
          }}
        />
      </TouchableOpacity>
    </View>
  ), [width]); // dependency on width (though width is constant)

  useFocusEffect(
    useCallback(() => {

      fetchPromotions();
      fetchCategory();
      fetchBooking();
      fetchTopServices();
      // Optional cleanup when screen loses focus
      return () => {
        // cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    const getData = async () => {
      try {
        const userDetails = await SecureStore.getItemAsync("userData");

        if (userDetails) {
          setUserData(JSON.parse(userDetails));
        }

        const location = await getCurrentLocation();

        console.log("Location:", location);

        // Store the object directly
        setCurrentLocation(location);
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await getActivePromotions();
      const promotionsData = response?.data?.items || []
      setPromotions(promotionsData)
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await getCategories();
      const categoryData = response?.data || []
      setCategory(categoryData)
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const fetchBooking = async () => {
    try {
      const response = await getMyBookings();
      const bookingData = response?.data?.items || []
      setBooking(bookingData)
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const fetchTopServices = async () => {
    try {
      const response = await getTopServices();
      console.log("services::", response?.data)
      const servicesData = response?.data || []
      setTopServices(servicesData)
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  // ─── Component ──────────────────────────────────────────────────
  const CategoryIcon = ({ cat }) => {
    const emoji = categoryEmojiMap[cat.icon] || "🛠️";
    const bgColor = getCategoryColor(cat.id);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/booking/services",
            params: { categoryId: cat.id, categoryName: cat.name },
          })
        }
        activeOpacity={0.7}
        style={{ alignItems: "center", width: (width - 40 - 24) / 4 }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 6,
            shadowColor: "#17381B",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: "#374151",
            textAlign: "center",
            lineHeight: 13,
          }}
          numberOfLines={2}
        >
          {cat.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── Header with Full Width Image ── */}
        <ImageBackground
          source={require("../../../assets/images/homebanner.png")}
          style={{
            width: width,
            aspectRatio: 1.5,
            paddingHorizontal: 20,

          }}
          resizeMode="contain"
        >
          {/* Top row - Location and Icons */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: insets.top + 8,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.7}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "rgba(0,0,0,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapPin size={14} color="#000000" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#000000",
                      fontWeight: "500",
                    }}
                  >
                    {currentLocation
                      ? `${currentLocation?.city}, ${currentLocation?.country}`
                      : "Fetching location..."}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* <TouchableOpacity
                onPress={() => router.push("/(tabs)/wallet")}
                style={{
                  backgroundColor: "rgba(0,0,0,0.08)",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Wallet size={14} color="#000000" />
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#000000" }}>
                  ₹1,250
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={() => router.push("/notifications")}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={18} color="#000000" />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#2ECC71",
                      borderWidth: 1.5,
                      borderColor: "#FFFFFF",
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#000",
                fontWeight: "600",
                opacity: 0.7,
              }}
            >
              {getGreeting()}
            </Text>

            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: "#000",
                marginTop: 2,
              }}
            >
              {userData?.name || "User"}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#000",
                marginTop: 8,
                opacity: 0.7,
                lineHeight: 20,
              }}
            >
              Book verified professionals{"\n"}for any job, anytime.
            </Text>
          </View>
        </ImageBackground>

        {/* Search bar - Fixed overlap */}
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: -26,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              paddingHorizontal: 16,
              height: 52,
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: "#1F2937" }}
              placeholder="Search services or workers..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            <View
              style={{
                backgroundColor: "#17381B",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>
                SEARCH
              </Text>
            </View>
          </View>
        </View>

        {/* ── Single Banner Offer ── */}

        <View style={{ marginTop: 16 }}>
          <FlatList
            data={promotions}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={EmptyComponent}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  width: width,
                  paddingHorizontal: 20,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 16,
                    resizeMode: "cover",
                  }}
                />
              </TouchableOpacity>
            )}
          />
        </View>
        {/* ── Premium Features ── */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            marginTop: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: 16,
            marginHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            {[
              { icon: Shield, label: "Verified Workers", color: "#17381B" },
              { icon: CreditCard, label: "Secure Payments", color: "#17381B" },
              { icon: Clock, label: "24/7 Support", color: "#17381B" },
              { icon: Headphones, label: "Easy Booking", color: "#17381B" },
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  width: "48%",
                  backgroundColor: "#F8FAFF",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${item.color}15`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <item.icon size={18} color={item.color} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#1F2937", flex: 1 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Categories - 4 per row ── */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            marginTop: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: 16,
            marginHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
              Services
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/booking/categories",
                  params: {
                    category: JSON.stringify(category),
                  },
                })
              } style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#17381B" }}>
                See All
              </Text>
              <ChevronRight size={15} color="#17381B" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              rowGap: 14,
              columnGap: 8,
            }}
          >
            {category?.slice(0, 8).map((cat) => (
              <CategoryIcon key={cat.id} cat={cat} />
            ))}
          </View>
        </View>

        {/* ── Active Bookings ── */}
        {booking.filter(
          (b) => b.status === "pending" || b.status === "accepted" || b.status === "in-progress"
        ).length > 0 && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                marginTop: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 16,
                marginHorizontal: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
                  Your Bookings
                </Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/bookings")}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#17381B" }}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {booking
                .filter((b) => b.status === "pending" || b.status === "accepted" || b.status === "in-progress")
                .slice(0, 3) // show only a few on home screen
                .map((booking) => {
                  const isActive = booking.status === "accepted" || booking.status === "in-progress";
                  const isUpcoming = booking.status === "pending";
                  const workerName = booking.job?.worker?.user?.name || "Worker";
                  const serviceName = booking.service?.name || "Service";
                  const dateStr = booking.scheduledDate || "";

                  return (
                    <TouchableOpacity
                      key={booking.id}
                      onPress={() =>
                        router.push({
                          pathname: "/booking/accepted",
                          params: { bookingId: booking.id },
                        })
                      }
                      activeOpacity={0.8}
                      style={{
                        marginBottom: 8,
                        backgroundColor: "#F8FAFF",
                        borderRadius: 14,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#E8F5E9",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "#E8F5E9",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>👤</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1F2937" }}>
                              {serviceName}
                            </Text>
                            <View
                              style={{
                                backgroundColor: isActive ? "#DCFCE7" : "#E8F5E9",
                                borderRadius: 6,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "700",
                                  color: isActive ? "#16A34A" : "#17381B",
                                }}
                              >
                                {isActive ? "🟢 Active" : "📅 Upcoming"}
                              </Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
                            {workerName} • {dateStr}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        {/* ── Popular Services (Top Services) ── */}
        <View style={{ marginTop: 16, paddingBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
              Popular Services
            </Text>
            <TouchableOpacity onPress={() => router.push("/booking/categories")}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#17381B" }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {topServices.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              style={{ flexGrow: 0 }}
            >
              {topServices.map((item) => {
                const service = item.service;
                const bookingCount = item.bookingCount;
                const cat = category.find((c) => c.id === service.categoryId);
                const categoryEmojiMap = {
                  Venus: "💆‍♀️",
                  Mars: "💇‍♂️",
                  Wrench: "🔧",
                  Sparkles: "✨",
                  Hammer: "🔨",
                  PaintRoller: "🎨",
                  TrainFront: "🚆",
                  Package: "📦",
                  Construction: "🏗️",
                  Truck: "🚚",
                  Droplet: "💧",
                  Sprout: "🌱",
                  Tractor: "🚜",
                };
                const emoji = categoryEmojiMap[cat?.icon] || "🛠️";
                const rating = 4.5; // placeholder

                return (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() =>
                      router.push({
                        pathname: "/booking/services",
                        params: {
                          categoryId: service.categoryId,
                          categoryName: cat?.name,
                        },
                      })
                    }
                    activeOpacity={0.85}
                    style={{
                      width: 160,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.07,
                      shadowRadius: 10,
                      elevation: 4,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 90,
                        borderRadius: 12,
                        backgroundColor: "#E8F5E9",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ fontSize: 40 }}>{emoji}</Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#1F2937",
                        marginBottom: 2,
                      }}
                    >
                      {service.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 6,
                      }}
                    >
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#374151" }}>
                        {rating}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                        ({bookingCount} bookings)
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "900", color: "#17381B" }}>
                        ₹{service.basePrice}
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#17381B",
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>
                          BOOK
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            // ─── Fallback when no top services ──────────────────────────
            <View
              style={{
                marginHorizontal: 20,
                paddingVertical: 30,
                paddingHorizontal: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginBottom: 4,
                }}
              >
                No Popular Services Yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Services will appear here once they get enough completed bookings.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/booking/categories")}
                style={{
                  marginTop: 12,
                  backgroundColor: "#17381B",
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
                  Browse Services
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* ── Referral Banner ── */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={{ marginHorizontal: 20, marginBottom: 20, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#17381B", "#2ECC71"]}
            style={{ padding: 16, flexDirection: "row", alignItems: "center" }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginBottom: 2,
                }}
              >
                Refer & Earn ₹100 🎁
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 18,
                }}
              >
                Invite friends and earn rewards for every successful referral
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>🎁</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
      </ScrollView>
    </View>
  );
}