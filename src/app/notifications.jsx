import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Tag,
  Calendar,
  Wallet,
  Star,
  Bell,
  Trash2,
  Check,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, NOTIFICATIONS } from "../data/dummy";

const ICON_MAP = { CheckCircle, CreditCard, Tag, Calendar, Wallet, Star, Bell };

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const TYPE_LABELS = {
    booking: "Booking",
    payment: "Payment",
    offer: "Offer",
    promo: "Promo",
    rating: "Review",
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F2F5" }}>
      {/* Header */}
      <LinearGradient
        colors={["#0F2660", "#1A3C8F"]}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
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
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            Notifications
          </Text>
          <TouchableOpacity
            onPress={markAllRead}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
              All Read
            </Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </Text>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {notifs.map((notif, idx) => {
          const Icon = ICON_MAP[notif.icon] || Bell;
          const isFirst = idx === 0 || notifs[idx - 1].read !== notif.read;
          return (
            <TouchableOpacity
              key={notif.id}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginHorizontal: 16,
                marginBottom: 10,
                backgroundColor: notif.read ? "#FFFFFF" : "#EFF4FF",
                borderRadius: 18,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 3,
                borderWidth: notif.read ? 0 : 1.5,
                borderColor: notif.read ? "transparent" : COLORS.primary + "30",
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: notif.color + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Icon size={22} color={notif.color} />
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: COLORS.dark,
                      }}
                    >
                      {notif.title}
                    </Text>
                    {!notif.read && (
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: COLORS.accent,
                        }}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.lightGray }}>
                    {notif.time}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: COLORS.gray, lineHeight: 20 }}
                >
                  {notif.message}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <View
                    style={{
                      backgroundColor: notif.color + "15",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: notif.color,
                      }}
                    >
                      {TYPE_LABELS[notif.type] || "Update"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {notifs.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Text style={{ fontSize: 56 }}>🔔</Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: COLORS.dark,
                marginTop: 16,
              }}
            >
              No Notifications
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.gray,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              You're all caught up!
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
