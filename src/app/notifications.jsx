import { useState, useEffect, useCallback, useRef } from "react";
import {View,Text,ScrollView,TouchableOpacity,ActivityIndicator,RefreshControl,Alert,Modal,Animated,Dimensions,TouchableWithoutFeedback,StatusBar} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { deleteNotification,getNotifications,markAllAsRead,markAsRead } from "../../services/api/notifications";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Icon & color mapping based on notification `type` ─────────
const TYPE_CONFIG = {
  booking: {
    icon: "calendar",
    color: "#2563EB",
    label: "Booking",
  },
  job: {
    icon: "briefcase",
    color: "#16A34A",
    label: "Job",
  },
  payment: {
    icon: "credit-card",
    color: "#7C3AED",
    label: "Payment",
  },
  offer: {
    icon: "tag",
    color: "#F59E0B",
    label: "Offer",
  },
  promo: {
    icon: "gift",
    color: "#EC4899",
    label: "Promo",
  },
  rating: {
    icon: "star",
    color: "#F59E0B",
    label: "Review",
  },
  system: {
    icon: "bell",
    color: "#6B7280",
    label: "System",
  },
};

// ─── Format relative time ──────────────────────────────────────
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const diffSec = (Date.now() - date.getTime()) / 1000;

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
};

// ─── Format full date for detail view ─────────────────────────
const formatFullDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// ═══════════════════════════════════════════════════════════════
//  Bottom Sheet for Notification Detail
// ═══════════════════════════════════════════════════════════════
function NotificationDetailSheet({ visible, onClose, notification }) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible || !notification) return null;

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
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
                height: SCREEN_HEIGHT * 0.55,
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                transform: [{ translateY }],
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
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#1F2937",
                  }}
                >
                  Notification
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
                  padding: 20,
                  paddingBottom: 30,
                }}
                showsVerticalScrollIndicator={false}
              >
                {/* Icon + Type */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: config.color + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      name={config.icon}
                      size={26}
                      color={config.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: config.color + "15",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        alignSelf: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: config.color,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {config.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                      }}
                    >
                      {formatFullDate(notification.sentAt || notification.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#1F2937",
                    marginBottom: 12,
                    lineHeight: 28,
                  }}
                >
                  {notification.title}
                </Text>

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#F3F8EF",
                    marginBottom: 16,
                  }}
                />

                {/* Body */}
                <Text
                  style={{
                    fontSize: 15,
                    color: "#374151",
                    lineHeight: 24,
                  }}
                >
                  {notification.body || notification.message}
                </Text>

                {/* Extra data (if any) */}
                {notification.data &&
                  Object.keys(notification.data).length > 0 && (
                    <View
                      style={{
                        marginTop: 20,
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "800",
                          color: "#9CA3AF",
                          letterSpacing: 0.5,
                          marginBottom: 8,
                        }}
                      >
                        ADDITIONAL DETAILS
                      </Text>
                      {Object.entries(notification.data).map(([key, value]) => (
                        <View
                          key={key}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 6,
                            borderBottomWidth: 1,
                            borderBottomColor: "#F3F8EF",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              flex: 1,
                            }}
                          >
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#1F2937",
                              fontWeight: "700",
                              flex: 1,
                              textAlign: "right",
                            }}
                            numberOfLines={2}
                          >
                            {String(value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                {/* Read status */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 24,
                    paddingVertical: 12,
                    backgroundColor: "#F3F8EF",
                    borderRadius: 12,
                  }}
                >
                  <Icon2 name="done-all" size={16} color="#16A34A" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#16A34A",
                    }}
                  >
                    Marked as read
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Main Screen
// ═══════════════════════════════════════════════════════════════
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // Detail sheet
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ─── Fetch notifications ─────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({
        page: 1,
        limit: 50,
      });

      const items =
        res?.data?.items ||
        res?.items ||
        (Array.isArray(res?.data) ? res.data : []);

      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      Alert.alert(
        "Error",
        err?.error || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  // ─── Open detail sheet + mark as read ─────────────────
  const handleOpenNotification = async (notif) => {
    setSelectedNotif(notif);
    setShowDetail(true);

    // Mark as read if not already
    if (!notif.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setSelectedNotif((prev) => ({ ...prev, isRead: true }));

      try {
        await markAsRead(notif.id);
      } catch (err) {
        console.error("Mark as read failed:", err);
        // Revert on failure
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, isRead: false } : n
          )
        );
      }
    }
  };

  // ─── Mark all as read ─────────────────────────────────
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    Alert.alert(
      "Mark All as Read",
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: async () => {
            setMarkingAll(true);
            // Optimistic update
            const prevNotifs = [...notifications];
            setNotifications((prev) =>
              prev.map((n) => ({ ...n, isRead: true }))
            );

            try {
              await markAllAsRead();
            } catch (err) {
              console.error("Mark all read error:", err);
              // Revert on failure
              setNotifications(prevNotifs);
              Alert.alert(
                "Error",
                err?.error || "Failed to mark all as read"
              );
            } finally {
              setMarkingAll(false);
            }
          },
        },
      ]
    );
  };

  // ─── Delete notification ─────────────────────────────
  const handleDelete = (id) => {
    Alert.alert("Delete Notification", "Remove this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const prevNotifs = [...notifications];
          setNotifications((prev) => prev.filter((n) => n.id !== id));

          try {
            await deleteNotification(id);
          } catch (err) {
            console.error("Delete error:", err);
            setNotifications(prevNotifs);
            Alert.alert("Error", "Failed to delete notification");
          }
        },
      },
    ]);
  };

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F0F2F5",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F2F5" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#17381B",
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
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            Notifications
          </Text>

          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={markingAll}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                minWidth: 70,
                alignItems: "center",
              }}
            >
              {markingAll ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  All Read
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 70 }} />
          )}
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.map((notif) => {
          const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
          const isRead = notif.isRead;

          return (
            <TouchableOpacity
              key={notif.id}
              onPress={() => handleOpenNotification(notif)}
              onLongPress={() => handleDelete(notif.id)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginHorizontal: 16,
                marginBottom: 10,
                backgroundColor: isRead ? "#FFFFFF" : "#EFF4FF",
                borderRadius: 18,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 3,
                borderWidth: isRead ? 0 : 1.5,
                borderColor: isRead
                  ? "transparent"
                  : config.color + "40",
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: config.color + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Icon name={config.icon} size={22} color={config.color} />
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
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: "#1F2937",
                        flexShrink: 1,
                      }}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    {!isRead && (
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: "#2ECC71",
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      marginLeft: 8,
                    }}
                  >
                    {formatRelativeTime(notif.sentAt || notif.createdAt)}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {notif.body || notif.message}
                </Text>

                <View style={{ marginTop: 8 }}>
                  <View
                    style={{
                      backgroundColor: config.color + "15",
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
                        color: config.color,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {notifications.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="bell-off" size={48} color="#D1D5DB" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1F2937",
                marginTop: 16,
              }}
            >
              No Notifications
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
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

      {/* Detail Bottom Sheet */}
      <NotificationDetailSheet
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedNotif(null);
        }}
        notification={selectedNotif}
      />
    </View>
  );
}