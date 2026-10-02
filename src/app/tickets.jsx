import { useState, useEffect, useCallback, useRef } from "react";
import {View,Text,ScrollView,TouchableOpacity,Alert,StatusBar,ActivityIndicator,RefreshControl,Modal,Animated,Dimensions,TouchableWithoutFeedback,TextInput,KeyboardAvoidingView,Platform} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { ticketService } from "../../services/api/tickets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Status Config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  open: {
    label: "Open",
    color: "#2563EB",
    bg: "#DBEAFE",
    icon: "clock",
  },
  "in-progress": {
    label: "In Progress",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "refresh-cw",
  },
  resolved: {
    label: "Resolved",
    color: "#16A34A",
    bg: "#DCFCE7",
    icon: "check-circle",
  },
  closed: {
    label: "Closed",
    color: "#6B7280",
    bg: "#F3F4F6",
    icon: "lock",
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#16A34A", bg: "#DCFCE7" },
  medium: { label: "Medium", color: "#F59E0B", bg: "#FEF3C7" },
  high: { label: "High", color: "#DC2626", bg: "#FEE2E2" },
  urgent: { label: "Urgent", color: "#7C3AED", bg: "#EDE9FE" },
};

const FILTERS = ["all", "open", "in-progress", "resolved", "closed"];

// ─── Format date ──────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000; // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// ─── Bottom Sheet for Ticket Detail ──────────────────────────
function TicketDetailSheet({ visible, onClose, ticket, onReply, replying }) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) setReplyText("");
  }, [visible]);

  if (!visible || !ticket) return null;

  const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priorityConf =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const replies = ticket.TicketReplies || ticket.replies || [];
  const isClosed = ["resolved", "closed"].includes(ticket.status);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    await onReply(replyText.trim());
    setReplyText("");
  };

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
                height: SCREEN_HEIGHT * 0.85,
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
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontWeight: "700",
                      marginBottom: 2,
                    }}
                  >
                    TICKET #{ticket.id}
                  </Text>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      color: "#1F2937",
                    }}
                    numberOfLines={1}
                  >
                    {ticket.subject}
                  </Text>
                </View>
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

              {/* Status & Priority row */}
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  gap: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F8EF",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: statusConf.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Icon
                    name={statusConf.icon}
                    size={11}
                    color={statusConf.color}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: statusConf.color,
                    }}
                  >
                    {statusConf.label}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: priorityConf.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: priorityConf.color,
                    }}
                  >
                    {priorityConf.label} Priority
                  </Text>
                </View>

                {ticket.category && (
                  <View
                    style={{
                      backgroundColor: "#F3F4F6",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#6B7280",
                        textTransform: "capitalize",
                      }}
                    >
                      {ticket.category}
                    </Text>
                  </View>
                )}
              </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={20}
              >
                <ScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 20,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Original message */}
                  <View
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: "#17381B",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="user" size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "800",
                            color: "#1F2937",
                          }}
                        >
                          You
                        </Text>
                        <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {formatDate(ticket.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        lineHeight: 21,
                      }}
                    >
                      {ticket.message}
                    </Text>
                  </View>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "800",
                          color: "#9CA3AF",
                          letterSpacing: 1,
                          marginBottom: 10,
                          textTransform: "uppercase",
                        }}
                      >
                        Conversation ({replies.length})
                      </Text>

                      {replies.map((reply, i) => {
                        // Determine if this is from admin (support) or the user
                        const isAdmin =
                          reply.User?.role === "admin" ||
                          reply.isAdmin === true;

                        return (
                          <View
                            key={reply.id || i}
                            style={{
                              marginBottom: 12,
                              alignSelf: isAdmin
                                ? "flex-start"
                                : "flex-end",
                              maxWidth: "88%",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: isAdmin
                                  ? "#E8F5E9"
                                  : "#17381B",
                                borderRadius: 14,
                                padding: 12,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 4,
                                }}
                              >
                                <Icon
                                  name={isAdmin ? "headphones" : "user"}
                                  size={11}
                                  color={
                                    isAdmin
                                      ? "#17381B"
                                      : "rgba(255,255,255,0.8)"
                                  }
                                />
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "800",
                                    color: isAdmin
                                      ? "#17381B"
                                      : "rgba(255,255,255,0.9)",
                                  }}
                                >
                                  {isAdmin
                                    ? reply.User?.name || "Support Team"
                                    : "You"}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontSize: 14,
                                  lineHeight: 20,
                                  color: isAdmin
                                    ? "#1F2937"
                                    : "#FFFFFF",
                                }}
                              >
                                {reply.message}
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#9CA3AF",
                                marginTop: 4,
                                alignSelf: isAdmin
                                  ? "flex-start"
                                  : "flex-end",
                              }}
                            >
                              {formatDate(reply.createdAt)}
                            </Text>
                          </View>
                        );
                      })}
                    </>
                  )}
                </ScrollView>

                {/* Reply input */}
                {!isClosed ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#F3F8EF",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: "#F3F8EF",
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        fontSize: 14,
                        color: "#1F2937",
                        maxHeight: 100,
                      }}
                      placeholder="Type a reply..."
                      placeholderTextColor="#9CA3AF"
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                      editable={!replying}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={!replyText.trim() || replying}
                      style={{
                        backgroundColor: !replyText.trim()
                          ? "#D1D5DB"
                          : "#17381B",
                        borderRadius: 22,
                        padding: 12,
                      }}
                    >
                      {replying ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Icon name="send" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      padding: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F3F8EF",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontWeight: "600",
                      }}
                    >
                      This ticket is {ticket.status}. Reply is disabled.
                    </Text>
                  </View>
                )}
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function MyTicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  // Ticket detail
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replying, setReplying] = useState(false);

  // ─── Fetch tickets ────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const res = await ticketService.getMyTickets({ page: 1, limit: 50 });
      const items =
        res?.data?.items ||
        res?.items ||
        (Array.isArray(res?.data) ? res.data : []);
      setTickets(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch tickets error:", err);
      Alert.alert("Error", err?.error || "Failed to load tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
  };

  // ─── Open ticket detail ──────────────────────────────
  const handleOpenTicket = async (ticket) => {
    setShowDetail(true);
    setSelectedTicket(ticket); // show what we have immediately
    setLoadingDetail(true);

    try {
      const res = await ticketService.getTicketById(ticket.id);
      const fullTicket = res?.data || res;
      setSelectedTicket(fullTicket);
    } catch (err) {
      console.error("Load ticket detail error:", err);
      // Keep the list version
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Reply to ticket ─────────────────────────────────
  const handleReply = async (message) => {
    if (!selectedTicket) return;
    setReplying(true);
    try {
      await ticketService.replyToTicket(selectedTicket.id, message);

      // Refetch the ticket to get the new reply
      const res = await ticketService.getTicketById(selectedTicket.id);
      const fullTicket = res?.data || res;
      setSelectedTicket(fullTicket);

      // Refresh the list to update the last activity
      fetchTickets();
    } catch (err) {
      Alert.alert("Error", err?.error || "Failed to send reply");
      throw err;
    } finally {
      setReplying(false);
    }
  };

  // ─── Filter tickets ──────────────────────────────────
  const filteredTickets =
    filter === "all"
      ? tickets
      : tickets.filter((t) => t.status === filter);

  // ─── Status counts for filter chips ─────────────────
  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    "in-progress": tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  // ─── Loading ─────────────────────────────────────────
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
          Loading tickets...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#FFFFFF",
              }}
            >
              My Tickets
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* New ticket button */}
          <TouchableOpacity
            onPress={() => router.push("/support")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#2ECC71",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text
              style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F8EF",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map((f) => {
            const count = statusCounts[f] || 0;
            const active = filter === f;
            const conf = f === "all" ? null : STATUS_CONFIG[f];
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active
                    ? "#17381B"
                    : conf?.bg || "#F3F8EF",
                  borderWidth: 1,
                  borderColor: active ? "#17381B" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: active ? "#FFFFFF" : conf?.color || "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {f === "all" ? "All" : f.replace("-", " ")}
                </Text>
                {count > 0 && (
                  <View
                    style={{
                      backgroundColor: active
                        ? "rgba(255,255,255,0.25)"
                        : conf?.color || "#9CA3AF",
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 8,
                      minWidth: 18,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: active ? "#FFFFFF" : "#FFFFFF",
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Ticket list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTickets.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 60,
              paddingHorizontal: 40,
            }}
          >
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 2,
                borderColor: "#E5E7EB",
              }}
            >
              <Icon2
                name="confirmation-number"
                size={42}
                color="#D1D5DB"
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              No {filter === "all" ? "" : filter} tickets
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              {filter === "all"
                ? "You haven't raised any support tickets yet."
                : `You have no ${filter.replace("-", " ")} tickets.`}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/support")}
              style={{
                backgroundColor: "#17381B",
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="plus" size={18} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "800",
                  fontSize: 14,
                }}
              >
                Raise a Ticket
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTickets.map((ticket) => {
            const statusConf =
              STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const priorityConf =
              PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
            const replies =
              ticket.TicketReplies?.length || ticket.replies?.length || 0;

            return (
              <TouchableOpacity
                key={ticket.id}
                onPress={() => handleOpenTicket(ticket)}
                activeOpacity={0.85}
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
                {/* Top row: ID + Status */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: "#9CA3AF",
                      letterSpacing: 1,
                    }}
                  >
                    TICKET #{ticket.id}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: statusConf.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Icon
                      name={statusConf.icon}
                      size={11}
                      color={statusConf.color}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: statusConf.color,
                      }}
                    >
                      {statusConf.label.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Subject */}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 6,
                  }}
                  numberOfLines={2}
                >
                  {ticket.subject}
                </Text>

                {/* Message preview */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    lineHeight: 19,
                    marginBottom: 12,
                  }}
                  numberOfLines={2}
                >
                  {ticket.message}
                </Text>

                {/* Bottom row: Priority + Meta */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F3F8EF",
                  }}
                >
                  <View
                    style={{ flexDirection: "row", gap: 6 }}
                  >
                    <View
                      style={{
                        backgroundColor: priorityConf.bg,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "800",
                          color: priorityConf.color,
                        }}
                      >
                        {priorityConf.label.toUpperCase()}
                      </Text>
                    </View>

                    {replies > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          backgroundColor: "#F3F4F6",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        <Icon
                          name="message-square"
                          size={9}
                          color="#6B7280"
                        />
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "800",
                            color: "#6B7280",
                          }}
                        >
                          {replies}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon name="clock" size={11} color="#9CA3AF" />
                    <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {formatDate(ticket.updatedAt || ticket.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Detail sheet */}
      <TicketDetailSheet
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onReply={handleReply}
        replying={replying || loadingDetail}
      />
    </View>
  );
}