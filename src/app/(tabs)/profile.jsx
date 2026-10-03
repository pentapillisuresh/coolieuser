import { useState, useEffect, useCallback, useRef } from "react";
import {View,Text,ScrollView,TouchableOpacity,Switch,Alert,StatusBar,ActivityIndicator,RefreshControl,Modal,Animated,Dimensions,TouchableWithoutFeedback} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { getProfile } from "../../../services/api/user";
import { logout } from "./../../../services/api/auth";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Format date helper ─────────────────────────────────────────
const formatMemberSince = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

// ─── Reusable Bottom Sheet ──────────────────────────────────────
function BottomSheet({ visible, onClose, title, children, heightRatio = 0.7 }) {
  const translateY = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={{
                height: SCREEN_HEIGHT * heightRatio,
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                transform: [{ translateY }],
                paddingBottom: 20,
              }}
            >
              {/* Drag handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#D1D5DB",
                  alignSelf: "center",
                  marginTop: 10,
                  marginBottom: 4,
                }}
              />

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F8EF",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#1F2937",
                  }}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#F3F8EF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="x" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 30,
                }}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Info row used inside sheets ────────────────────────────────
function InfoRow({ label, value, icon }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F8EF",
        gap: 12,
      }}
    >
      {icon && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#E8F5E9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={16} color="#17381B" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#1F2937",
            fontWeight: "700",
            marginTop: 3,
          }}
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Sheet visibility
  const [showPersonal, setShowPersonal] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // ─── Fetch profile ──────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await getProfile();
      const user = res?.data?.user || res?.data || res?.user || res;
      setProfile(user);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(err?.error || err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
  };

  // ─── Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  // ─── Reusable MenuItem ─────────────────────────────────
  const MenuItem = ({
    iconName,
    iconBg,
    title,
    subtitle,
    onPress,
    rightContent,
    iconColor,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F8EF",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: iconBg || "#F3F8EF",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Icon name={iconName} size={20} color={iconColor || "#17381B"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1F2937" }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent !== undefined ? (
        rightContent
      ) : (
        <Icon name="chevron-right" size={18} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }) => (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          color: "#9CA3AF",
          letterSpacing: 1,
          marginHorizontal: 20,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginHorizontal: 20,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {children}
      </View>
    </View>
  );

  // ─── Loading state ─────────────────────────────────────
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
          Loading profile...
        </Text>
      </View>
    );
  }

  // ─── Error / not found ────────────────────────────────
  if (!profile || error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F8EF",
          padding: 20,
        }}
      >
        <Icon name="alert-circle" size={40} color="#DC2626" />
        <Text style={{ marginTop: 12, color: "#6B7280", textAlign: "center" }}>
          {error || "Profile not found"}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#17381B",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "700" }}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#17381B",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Derived data ──────────────────────────────────────
  const bookings = profile.Bookings || [];
  const addresses = profile.Addresses || [];
  const totalBookings = bookings.length;
  const completedCount = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const memberSince = formatMemberSince(profile.createdAt);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const avatarLetter = (profile.name || "U").charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: "#17381B",
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#FFFFFF",
              marginBottom: 20,
              letterSpacing: 0.5,
            }}
          >
            Profile
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#2ECC71",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.3)",
                  overflow: "hidden",
                }}
              >
                {profile.profileImage ? (
                  <Icon name="user" size={36} color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 36,
                      color: "#FFFFFF",
                      fontWeight: "800",
                    }}
                  >
                    {avatarLetter}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push("/profile/edit")}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#2ECC71",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#17381B",
                }}
              >
                <Icon name="edit-2" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF" }}>
                {profile.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <Icon name="phone" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  {profile.mobile}
                </Text>
              </View>
              {profile.email ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                  }}
                >
                  <Icon name="mail" size={12} color="rgba(255,255,255,0.7)" />
                  <Text
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}
                  >
                    {profile.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            {[
              {
                label: "Total Bookings",
                value: totalBookings,
                icon: "award",
                color: "#F59E0B",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: "check-circle",
                color: "#2ECC71",
              },
              {
                label: "Member Since",
                value: memberSince,
                icon: "calendar",
                color: "#60A5FA",
              },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Icon2 name={stat.icon} size={20} color={stat.color} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    marginTop: 4,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            marginTop: -20,
            marginHorizontal: 20,
            flexDirection: "row",
            gap: 12,
          }}
        >
          {[
            {
              label: "My Bookings",
              icon: "book-open",
              bg: "#E8F5E9",
              onPress: () => router.push("/(tabs)/bookings"),
            },
            {
              label: "Wallet",
              icon: "wallet",
              bg: "#FEF3C7",
              onPress: () => router.push("/(tabs)/wallet"),
            },
            {
              label: "Support",
              icon: "headset",
              bg: "#DBEAFE",
              onPress: () => router.push("/support"),
            },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={action.onPress}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: action.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Icon3 name={action.icon} size={20} color="#17381B" />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#1F2937",
                }}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        <Section title="Account">
          <MenuItem
            iconName="user"
            iconBg="#E8F5E9"
            title="Personal Details"
            subtitle="Name, email, phone"
            onPress={() => setShowPersonal(true)}
          />
          <MenuItem
            iconName="map-pin"
            iconBg="#E8F5E9"
            title="Saved Addresses"
            subtitle={`${addresses.length} address${
              addresses.length !== 1 ? "es" : ""
            } saved`}
            onPress={() => setShowAddresses(true)}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <MenuItem
            iconName="globe"
            iconBg="#E8F5E9"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert("Language", "Coming soon")}
          />
          <MenuItem
            iconName="shield"
            iconBg="#E8F5E9"
            title="Privacy & Security"
            subtitle="Terms, privacy policy"
            onPress={() => setShowPrivacy(true)}
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <MenuItem
            iconName="help-circle"
            iconBg="#E8F5E9"
            title="Help & Support"
            subtitle="FAQs, tickets, live chat"
            onPress={() => router.push("/support")}
          />
          <MenuItem
            iconName="star"
            iconBg="#E8F5E9"
            title="Rate the App"
            subtitle="Share your experience"
            rightContent={null}
            onPress={() => Alert.alert("Thank you!", "Rating opens App Store")}
          />
        </Section>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "#FCA5A5",
            }}
          >
            <Icon name="log-out" size={20} color="#DC2626" />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#DC2626" }}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: 12,
            marginTop: 20,
            marginBottom: 32,
          }}
        >
          COOLI User App v1.0.0 · Made with ❤️ in India
        </Text>
      </ScrollView>

      {/* ─── Personal Details Sheet ─────────────────────────── */}
      <BottomSheet
        visible={showPersonal}
        onClose={() => setShowPersonal(false)}
        title="Personal Details"
      >
        <InfoRow label="Full Name" value={profile.name} icon="user" />
        <InfoRow label="Mobile Number" value={profile.mobile} icon="phone" />
        <InfoRow label="Email Address" value={profile.email} icon="mail" />
        <InfoRow
          label="Account Role"
          value={profile.role?.toUpperCase()}
          icon="shield"
        />
        <InfoRow
          label="Verified"
          value={profile.isVerified ? "Yes ✓" : "No"}
          icon="check-circle"
        />
        <InfoRow
          label="Member Since"
          value={new Date(profile.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          icon="calendar"
        />

        <TouchableOpacity
          onPress={() => {
            setShowPersonal(false);
            router.push("/profile/edit");
          }}
          style={{
            marginTop: 20,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: "#17381B",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ─── Addresses Sheet ─────────────────────────────────── */}
      <BottomSheet
        visible={showAddresses}
        onClose={() => setShowAddresses(false)}
        title="Saved Addresses"
      >
        {addresses.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Icon name="map-pin" size={40} color="#D1D5DB" />
            <Text style={{ marginTop: 8, color: "#6B7280" }}>
              No addresses saved
            </Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <View
              key={addr.id}
              style={{
                padding: 14,
                borderRadius: 14,
                backgroundColor: addr.isDefault ? "#E8F5E9" : "#F9FAFB",
                borderWidth: 1,
                borderColor: addr.isDefault ? "#17381B" : "#E5E7EB",
                marginBottom: 10,
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
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: "#17381B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      name={addr.label === "Home" ? "home" : "briefcase"}
                      size={15}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: "#1F2937",
                    }}
                  >
                    {addr.label || "Address"}
                  </Text>
                </View>
                {addr.isDefault && (
                  <View
                    style={{
                      backgroundColor: "#DCFCE7",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "800",
                        color: "#16A34A",
                      }}
                    >
                      DEFAULT
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 20,
                }}
              >
                {addr.address}
              </Text>

              {addr.latitude && addr.longitude && (
                <Text
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    marginTop: 6,
                  }}
                >
                  📍 {Number(addr.latitude).toFixed(4)},{" "}
                  {Number(addr.longitude).toFixed(4)}
                </Text>
              )}
            </View>
          ))
        )}

        <TouchableOpacity
          onPress={() => {
            setShowAddresses(false);
            router.push("/address/add");
          }}
          style={{
            marginTop: 10,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: "#17381B",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon name="plus" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
            Add New Address
          </Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ─── Privacy & Security Sheet ────────────────────────── */}
      <BottomSheet
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Privacy & Security"
        heightRatio={0.85}
      >
        {/* Security section */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: "#9CA3AF",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          SECURITY
        </Text>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 20,
              marginBottom: 8,
            }}
          >
            • Your account is protected with OTP-based authentication.
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 20,
              marginBottom: 8,
            }}
          >
            • All payments are processed through a secure, PCI-DSS compliant
            gateway (Razorpay).
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 20,
            }}
          >
            • Personal data is encrypted in transit and at rest.
          </Text>
        </View>

        {/* Terms & Conditions */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: "#9CA3AF",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          TERMS & CONDITIONS
        </Text>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {[
            "By using COOLI, you agree to provide accurate service details and pay for completed bookings promptly.",
            "All workers on the platform are independent professionals. COOLI acts as a discovery and coordination platform only.",
            "Cancellations made less than 2 hours before the scheduled time may attract a cancellation fee.",
            "Disputes must be raised through the in-app Support section within 24 hours of service completion.",
            "COOLI reserves the right to suspend accounts for misuse, abuse, or fraudulent activity.",
          ].map((t, i) => (
            <Text
              key={i}
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 20,
                marginBottom: i < 4 ? 8 : 0,
              }}
            >
              {i + 1}. {t}
            </Text>
          ))}
        </View>

        {/* Privacy Policy */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: "#9CA3AF",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          PRIVACY POLICY
        </Text>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 14,
          }}
        >
          {[
            "We collect your name, mobile number, email, and address to facilitate bookings and communication with service providers.",
            "Your live location is used only during an active booking to help the assigned worker locate you. It is never shared with third parties.",
            "Payment information is processed by our gateway partner and is never stored on COOLI servers.",
            "You can request deletion of your account and associated data anytime via Support.",
            "We may send service-related notifications and promotional offers. You can opt out from the Profile settings.",
          ].map((p, i) => (
            <Text
              key={i}
              style={{
                fontSize: 13,
                color: "#374151",
                lineHeight: 20,
                marginBottom: i < 4 ? 8 : 0,
              }}
            >
              {i + 1}. {p}
            </Text>
          ))}
        </View>

        <Text
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Last updated: October 2026
        </Text>
      </BottomSheet>
    </View>
  );
}