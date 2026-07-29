import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { COLORS, WORKERS, SERVICES } from "../../data/dummy";

export default function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  console.log('WorkersScreen - Received params:', params);

  const BADGE_COLOR = {
    "Top Rated": "#F59E0B",
    Expert: "#17381B",
    "Senior Expert": "#7C3AED",
  };

  // Get the service name and category from params
  const serviceName = params.serviceName?.toString() || '';
  const categoryId = params.categoryId?.toString() || '';

  // Function to filter workers based on service and category
  const getFilteredWorkers = () => {
    // If no category or service, return all workers
    if (!categoryId && !serviceName) {
      return WORKERS;
    }

    // Get the service details to understand what skills are needed
    const categoryServices = SERVICES[categoryId] || [];
    const selectedService = categoryServices.find(s => s.name === serviceName);
    
    console.log('Selected Service:', selectedService);
    console.log('Category Services:', categoryServices);

    // If we have a specific service, filter workers by matching skills
    if (selectedService) {
      // Extract keywords from service name for matching
      const serviceKeywords = selectedService.name.toLowerCase().split(' ');
      
      return WORKERS.filter(worker => {
        // Check if worker has any skill that matches the service
        return worker.skills.some(skill => {
          const skillLower = skill.toLowerCase();
          return serviceKeywords.some(keyword => 
            skillLower.includes(keyword) || 
            keyword.includes(skillLower.split(' ')[0])
          );
        });
      });
    }

    // If no specific service but we have category, filter by category
    // This is a fallback - you can customize based on your needs
    const categoryKeywords = {
      'electrician': ['Wiring', 'Fan', 'Switch', 'Light', 'MCB', 'Inverter'],
      'plumber': ['Pipe', 'Tap', 'Toilet', 'Tank', 'Heater'],
      'cleaning': ['Cleaning', 'Home', 'Kitchen', 'Bathroom', 'Sofa', 'Carpet'],
      'carpenter': ['Furniture', 'Door', 'Wardrobe', 'Ceiling'],
      'painter': ['Painting', 'Texture', 'Waterproofing'],
      'beautician': ['Hair', 'Makeup', 'Facial', 'Mehendi', 'Waxing'],
      'railway': ['Luggage', 'Parcel', 'Platform', 'Wheelchair'],
      'construction': ['Mason', 'Helper', 'Steel', 'Tile'],
      'shifting': ['Loading', 'Shifting', 'Truck']
    };

    const keywords = categoryKeywords[categoryId] || [];
    if (keywords.length > 0) {
      return WORKERS.filter(worker => {
        return worker.skills.some(skill => {
          return keywords.some(keyword => 
            skill.toLowerCase().includes(keyword.toLowerCase())
          );
        });
      });
    }

    // Default: return all workers if no match found
    return WORKERS;
  };

  const filteredWorkers = getFilteredWorkers();
  console.log('Filtered Workers count:', filteredWorkers.length);

  const handleSelect = (worker) => {
    console.log('Selecting worker:', worker.name);
    
    const bookingParams = {
      categoryId: params.categoryId || '',
      categoryName: params.categoryName || '',
      serviceName: params.serviceName || '',
      servicePrice: params.servicePrice || '0',
      date: params.date || 'Today',
      time: params.time || '10:00 AM',
      address: params.address || '42, MG Road, Hyderabad',
      workerId: worker.id,
      workerName: worker.name,
      workerCharge: worker.charge.toString(),
      workerRating: worker.rating.toString(),
      workerExperience: worker.experience,
      workerAvatar: worker.avatar,
    };
    
    router.push({
      pathname: "/booking/confirm",
      params: bookingParams,
    });
  };

  const handleViewProfile = (worker) => {
    router.push({
      pathname: "/booking/worker-detail",
      params: { 
        ...params,
        workerId: worker.id,
        workerName: worker.name,
        workerCharge: worker.charge.toString(),
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
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
              fontSize: 22,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            Available Workers
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          {filteredWorkers.length} verified workers available for {serviceName || 'service'}
        </Text>
      </View>

      {filteredWorkers.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20,
        }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="search" size={36} color="#17381B" />
          </View>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            color: "#1F2937",
            marginTop: 12,
          }}>
            No Workers Available
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#6B7280",
            textAlign: 'center',
            marginTop: 8,
            paddingHorizontal: 20,
          }}>
            No workers are currently available for {serviceName}. 
            Please try another service or check back later.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              paddingHorizontal: 28,
              paddingVertical: 14,
              backgroundColor: "#17381B",
              borderRadius: 50,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
        >
          {filteredWorkers.map((worker, idx) => {
            const badgeColor = BADGE_COLOR[worker.badge] || "#17381B";
            return (
              <View
                key={worker.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 22,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.08,
                  shadowRadius: 14,
                  elevation: 6,
                }}
              >
                {/* Top banner if first */}
                {idx === 0 && (
                  <View
                    style={{
                      backgroundColor: "#F59E0B",
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon2 name="stars" size={14} color="#92400E" />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#92400E",
                      }}
                    >
                      ⭐ Recommended for {serviceName || 'you'}
                    </Text>
                  </View>
                )}

                <View style={{ padding: 18 }}>
                  {/* Worker header */}
                  <View
                    style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}
                  >
                    <View style={{ position: "relative" }}>
                      <View
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 20,
                          backgroundColor: "#17381B",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: "#E8F5E9",
                        }}
                      >
                        <Text style={{ fontSize: 32, color: "#FFFFFF" }}>
                          {worker.name.charAt(0)}
                        </Text>
                      </View>
                      {worker.verified && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "#16A34A",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 2,
                            borderColor: "#FFFFFF",
                          }}
                        >
                          <Icon2 name="verified" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "900",
                            color: "#1F2937",
                          }}
                        >
                          {worker.name}
                        </Text>
                        <View
                          style={{
                            backgroundColor: badgeColor + "20",
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: badgeColor,
                            }}
                          >
                            {worker.badge}
                          </Text>
                        </View>
                      </View>

                      {/* Rating */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginBottom: 6,
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon2
                            key={s}
                            name="star"
                            size={14}
                            color={s <= Math.floor(worker.rating) ? "#F59E0B" : "#E5E7EB"}
                          />
                        ))}
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "800",
                            color: "#1F2937",
                            marginLeft: 2,
                          }}
                        >
                          {worker.rating}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6B7280" }}>
                          ({worker.reviews} reviews)
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Icon name="briefcase" size={13} color="#6B7280" />
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>
                            {worker.experience}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Icon name="map-pin" size={13} color="#6B7280" />
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>
                            {worker.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Stats */}
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}
                  >
                    {[
                      {
                        label: "Jobs Done",
                        value: worker.jobs.toLocaleString(),
                        icon: "check-circle",
                      },
                      {
                        label: "Experience",
                        value: worker.experience,
                        icon: "award",
                      },
                      {
                        label: "Service Charge",
                        value: `₹${worker.charge}/hr`,
                        icon: "wallet",
                      },
                    ].map((stat, i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor: "#F3F8EF",
                          borderRadius: 12,
                          padding: 10,
                          alignItems: "center",
                        }}
                      >
                        <Icon2 name={stat.icon} size={16} color="#17381B" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#1F2937",
                            marginTop: 3,
                          }}
                        >
                          {stat.value}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#6B7280",
                            textAlign: "center",
                            marginTop: 1,
                          }}
                        >
                          {stat.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Skills */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0, marginBottom: 14 }}
                    contentContainerStyle={{ gap: 6 }}
                  >
                    {worker.skills.map((skill, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: "#E8F5E9",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#17381B",
                          }}
                        >
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleViewProfile(worker)}
                      style={{
                        flex: 1,
                        borderRadius: 50,
                        paddingVertical: 13,
                        borderWidth: 2,
                        borderColor: "#17381B",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#17381B",
                        }}
                      >
                        View Profile
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleSelect(worker)}
                      style={{
                        flex: 1,
                        borderRadius: 50,
                        backgroundColor: "#17381B",
                        paddingVertical: 13,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#FFFFFF",
                        }}
                      >
                        Select
                      </Text>
                      <Icon name="chevron-right" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}