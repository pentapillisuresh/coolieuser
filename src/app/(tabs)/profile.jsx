import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import Icon4 from "react-native-vector-icons/Entypo";
import { COLORS, USER_PROFILE, MY_BOOKINGS, LANGUAGES } from "../../data/dummy";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  const MenuItem = ({
    icon: IconComponent,
    iconBg,
    title,
    subtitle,
    onPress,
    rightContent,
    iconColor,
    iconName,
    iconFamily,
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
        <IconComponent name={iconName} size={20} color={iconColor || "#17381B"} />
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
      <View style={{ 
        backgroundColor: "#FFFFFF", 
        borderRadius: 16,
        marginHorizontal: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}>
        {children}
      </View>
    </View>
  );

  const completedCount = MY_BOOKINGS.filter(
    (b) => b.status === "completed",
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Premium Header ── */}
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
                }}
              >
                <Text style={{ fontSize: 36, color: "#FFFFFF", fontWeight: "800" }}>
                  {USER_PROFILE.name.charAt(0)}
                </Text>
              </View>
              <TouchableOpacity
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
              <Text
                style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF" }}
              >
                {USER_PROFILE.name}
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
                  {USER_PROFILE.phone}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 3,
                }}
              >
                <Icon name="mail" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  {USER_PROFILE.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Stats Row */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            {[
              {
                label: "Total Bookings",
                value: USER_PROFILE.totalBookings,
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
                value: USER_PROFILE.since, 
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
                    fontSize: 16,
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

        {/* Quick Actions - Premium Cards */}
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

        {/* Sections */}
        <Section title="Account">
          <MenuItem
            icon={Icon}
            iconName="user"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Personal Details"
            subtitle="Name, email, phone"
            onPress={() => {}}
          />
          <MenuItem
            icon={Icon}
            iconName="map-pin"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Saved Addresses"
            subtitle={`${USER_PROFILE.savedAddresses.length} addresses saved`}
            onPress={() => {}}
          />
          <MenuItem
            icon={Icon}
            iconName="credit-card"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Payment Methods"
            subtitle="UPI, Cards, Net Banking"
            onPress={() => {}}
          />
        </Section>

        <Section title="Preferences">
          <MenuItem
            icon={Icon}
            iconName="globe"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Language"
            subtitle={LANGUAGES.find((l) => l.id === selectedLang)?.name}
            onPress={() => {}}
          />
          <MenuItem
            icon={Icon}
            iconName="bell"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Push Notifications"
            subtitle="Booking updates, offers"
            rightContent={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: "#E5E7EB", true: "#2ECC71" }}
                thumbColor={notifEnabled ? "#17381B" : "#9CA3AF"}
              />
            }
          />
          <MenuItem
            icon={Icon}
            iconName="shield"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Privacy & Security"
            subtitle="Password, 2FA, data"
            onPress={() => {}}
          />
        </Section>

        <Section title="Support">
          <MenuItem
            icon={Icon}
            iconName="help-circle"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Help & Support"
            subtitle="FAQs, tickets, live chat"
            onPress={() => router.push("/support")}
          />
          <MenuItem
            icon={Icon}
            iconName="star"
            iconBg="#E8F5E9"
            iconColor="#17381B"
            title="Rate the App"
            subtitle="Share your experience"
            rightContent={null}
            onPress={() => Alert.alert("Thank you!", "Rating opens App Store")}
          />
        </Section>

        {/* Premium Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            marginHorizontal: 20,
            marginTop: 24,
          }}
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
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: "#DC2626" }}
            >
              Logout
            </Text>
          </View>
        </TouchableOpacity>

        {/* Version */}
        <Text
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: 12,
            marginTop: 20,
            marginBottom: 32,
          }}
        >
          KOOLI User App v1.0.0 · Made with ❤️ in India
        </Text>
      </ScrollView>
    </View>
  );
}