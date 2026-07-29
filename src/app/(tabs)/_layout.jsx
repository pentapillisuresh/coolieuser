import { Tabs } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: "#F9FAFB",
        },

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",

          height: 70 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },

        tabBarActiveTintColor: "#17381B",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon3
              name={focused ? "home" : "home"}
              solid={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color, focused }) => (
            <Icon3
              name={focused ? "calendar-check" : "calendar"}
              solid={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <Icon3
              name={focused ? "wallet" : "wallet"}
              solid={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Icon3
              name={focused ? "user" : "user"}
              solid={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}