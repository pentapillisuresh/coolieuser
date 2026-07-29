import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { WORKERS } from "../../data/dummy";

export default function WorkerDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker = WORKERS.find((w) => w.id === params.workerId) || WORKERS[0];

  const handleBook = () => {
    router.push({
      pathname: "/booking/confirm",
      params: {
        ...params,
        workerId: worker.id,
        workerName: worker.name,
        workerCharge: worker.charge,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero - No Gradient */}
        <View
          style={{
            backgroundColor: "#17381B",
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 56,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
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
              Worker Profile
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <View style={{ position: "relative", marginBottom: 16 }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#2ECC71",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              >
                <Text style={{ fontSize: 40, color: "#FFFFFF", fontWeight: "800" }}>
                  {worker.name.charAt(0)}
                </Text>
              </View>
              {worker.verified && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#16A34A",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  }}
                >
                  <Icon2 name="verified" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={{ fontSize: 24, fontWeight: "900", color: "#FFFFFF" }}>
              {worker.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                marginTop: 4,
              }}
            >
              {worker.bio}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 10,
              }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Icon2 key={s} name="star" size={16} color="#FFD700" />
              ))}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginLeft: 4,
                }}
              >
                {worker.rating}
              </Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                ({worker.reviews} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            marginTop: -28,
            marginHorizontal: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            flexDirection: "row",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 14,
            elevation: 8,
          }}
        >
          {[
            { label: "Experience", value: worker.experience, icon: "award" },
            { label: "Jobs Done", value: worker.jobs + "+", icon: "check-circle" },
            {
              label: "Charge",
              value: "₹" + worker.charge + "/hr",
              icon: "wallet",
            },
          ].map((stat, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 18,
                borderRightWidth: i < 2 ? 1 : 0,
                borderRightColor: "#F3F8EF",
              }}
            >
              <Icon2 name={stat.icon} size={20} color="#17381B" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: "#17381B",
                  marginTop: 6,
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ padding: 16, gap: 14, paddingBottom: 24 }}>
          {/* Skills */}
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
                fontSize: 16,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              Skills & Expertise
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {worker.skills.map((skill, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "#E8F5E9",
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#17381B",
                    }}
                  >
                    ✓ {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Available Slots */}
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
                marginBottom: 12,
              }}
            >
              <Icon name="clock" size={18} color="#17381B" />
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}
              >
                Available Slots
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {worker.available.map((slot, i) => (
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
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#16A34A",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1F2937",
                    }}
                  >
                    {slot}
                  </Text>
                  <View
                    style={{
                      marginLeft: "auto",
                      backgroundColor: "#DCFCE7",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#16A34A",
                      }}
                    >
                      Available
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
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
                fontSize: 16,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              Recent Reviews
            </Text>
            {worker.reviews_list.map((review, i) => (
              <View
                key={i}
                style={{
                  marginBottom: 14,
                  paddingBottom: 14,
                  borderBottomWidth: i < worker.reviews_list.length - 1 ? 1 : 0,
                  borderBottomColor: "#F3F8EF",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#17381B",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#FFFFFF",
                        }}
                      >
                        {review.user[0]}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1F2937",
                      }}
                    >
                      {review.user}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon2
                        key={s}
                        name="star"
                        size={12}
                        color={s <= review.rating ? "#F59E0B" : "#E5E7EB"}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#6B7280", lineHeight: 20 }}
                >
                  "{review.text}"
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 4,
                  }}
                >
                  {review.date}
                </Text>
              </View>
            ))}
          </View>

          {/* Book button - No Gradient */}
          <TouchableOpacity onPress={handleBook} activeOpacity={0.85}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#17381B",
                shadowColor: "#17381B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF" }}
              >
                Book {worker.name.split(" ")[0]}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}