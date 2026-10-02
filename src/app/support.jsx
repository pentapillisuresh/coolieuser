import { useState, useRef, useEffect, useCallback } from "react";
import {View,Text,ScrollView,TouchableOpacity,TextInput,Alert,Platform,StatusBar,ActivityIndicator,KeyboardAvoidingView,RefreshControl, Linking} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect,useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { ticketService } from "../../services/api/tickets";
import { getFAQs } from "../../services/api/faq";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const params = useLocalSearchParams();
  const {jobId,bookingId}=params;
  const [openFaq, setOpenFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [sending, setSending] = useState(false);

  // ─── Fetch FAQs ──────────────────────────────────────────
  const fetchFAQs = async () => {
    try {
      setFaqLoading(true);
      const response = await getFAQs({ page: 1, limit: 20 });
      // Handle { success, data: { items: [...] } } or { success, data: [...] }
      const items =
        response?.data?.items ||
        response?.data ||
        response?.items ||
        [];
      setFaqs(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Load FAQs error:", error);
      // Don't block UI if FAQs fail
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFAQs();
    setRefreshing(false);
  };

  // ─── Submit Ticket ───────────────────────────────────────
  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert("Required", "Please enter a subject");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Required", "Please enter your message");
      return;
    }

    setSending(true);
    try {
      const ticketPayload={
        subject: subject,
        message: message,
        category,
        bookingId,
        priority,
      };

      const response = await ticketService.createTicket(ticketPayload);

      // Backend returns: { success: true, data: { id, subject, ... } }
      const ticket = response?.data || response;

      if (response?.success || ticket?.id) {
        Alert.alert(
          "Ticket Raised!",
          `Our support team will respond within 24 hours.\n\nTicket ID: #${ticket.id || "N/A"}`,
          [
            {
              text: "View My Tickets",
              onPress: () => router.push("./(tabs)/home"),
            },
            { text: "OK" },
          ]
        );

        // Clear form
        setSubject("");
        setMessage("");
        setCategory("general");
        setPriority("medium");
      } else {
        throw new Error(response?.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Create ticket error:", error);
      Alert.alert(
        "Error",
        error?.error || error.message || "Failed to submit ticket. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // ─── Quick Actions ───────────────────────────────────────
  const QUICK_ACTIONS = [
    // {
    //   icon: "message-circle",
    //   label: "Live Chat",
    //   sub: "Instant reply",
    //   color: "#17381B",
    //   bg: "#E8F5E9",
    //   onPress: () =>
    //     Alert.alert("Live Chat", "Connecting to support agent..."),
    // },
    {
      icon: "phone",
      label: "Call Support",
      sub: "9AM – 9PM",
      color: "#16A34A",
      bg: "#DCFCE7",
      onPress: async () => {
        const phoneNumber = "18001234567";
    
        const url = `tel:${phoneNumber}`;
    
        const supported = await Linking.canOpenURL(url);
    
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to open the phone dialer.");
        }
      },
    },
        // {
    //   icon: "mail",
    //   label: "Email Us",
    //   sub: "Response in 24hr",
    //   color: "#2ECC71",
    //   bg: "#F3F8EF",
    //   onPress: () => Alert.alert("Email", "Opening email client..."),
    // },
    {
      icon: "file-text",
      label: "My Tickets",
      sub: "Track issues",
      color: "#7C3AED",
      bg: "#EDE9FE",
      onPress: () => router.push("/tickets"),
    },
  ];

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
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF" }}>
              Help & Support
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              We're here 24/7 for you
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Quick Actions */}
          <View
            style={{
              padding: 20,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity
                key={i}
                onPress={action.onPress}
                activeOpacity={0.8}
                style={{
                  width: "47%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  padding: 18,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.07,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: action.bg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 2,
                  }}
                >
                  {action.label}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {action.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 14,
              }}
            >
              Frequently Asked Questions
            </Text>

            {faqLoading ? (
              <View
                style={{
                  padding: 30,
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                }}
              >
                <ActivityIndicator size="small" color="#17381B" />
                <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 12 }}>
                  Loading FAQs...
                </Text>
              </View>
            ) : faqs.length === 0 ? (
              <View
                style={{
                  padding: 30,
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                }}
              >
                <Icon name="help-circle" size={32} color="#D1D5DB" />
                <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 13 }}>
                  No FAQs available right now
                </Text>
              </View>
            ) : (
              faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <TouchableOpacity
                    key={faq.id}
                    onPress={() => setOpenFaq(isOpen ? null : faq.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 10,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#1F2937",
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        {faq.question}
                      </Text>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isOpen ? "#17381B" : "#F3F8EF",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          name={isOpen ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={isOpen ? "#FFFFFF" : "#6B7280"}
                        />
                      </View>
                    </View>
                    {isOpen && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          marginTop: 12,
                          lineHeight: 22,
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: "#F3F8EF",
                        }}
                      >
                        {faq.answer}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Raise Ticket */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#1F2937",
                marginBottom: 4,
              }}
            >
              Raise a Ticket
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
              Describe your issue and our team will respond within 24 hours
            </Text>

            <View style={{ gap: 14 }}>
              {/* Subject */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                    marginBottom: 8,
                  }}
                >
                  Subject <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F3F8EF",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    color: "#1F2937",
                    borderWidth: 1,
                    borderColor: "#E8F5E9",
                  }}
                  placeholder="Brief subject of your issue"
                  placeholderTextColor="#9CA3AF"
                  value={subject}
                  onChangeText={setSubject}
                  returnKeyType="next"
                  editable={!sending}
                />
              </View>

              {/* Category */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {["general", "payment", "worker", "technical", "other"].map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        disabled={sending}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            category === cat ? "#17381B" : "#F3F8EF",
                          borderWidth: 1,
                          borderColor:
                            category === cat ? "#17381B" : "#E5E7EB",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: category === cat ? "#FFFFFF" : "#6B7280",
                            textTransform: "capitalize",
                          }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Priority */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                    marginBottom: 8,
                  }}
                >
                  Priority
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { key: "low", color: "#16A34A" },
                    { key: "medium", color: "#F59E0B" },
                    { key: "high", color: "#DC2626" },
                    { key: "urgent", color: "#7C3AED" },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      onPress={() => setPriority(p.key)}
                      disabled={sending}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          priority === p.key ? p.color : "#F3F8EF",
                        borderWidth: 1,
                        borderColor:
                          priority === p.key ? p.color : "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: priority === p.key ? "#FFFFFF" : "#6B7280",
                          textTransform: "capitalize",
                        }}
                      >
                        {p.key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Message */}
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1F2937",
                    marginBottom: 8,
                  }}
                >
                  Message <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F3F8EF",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    color: "#1F2937",
                    borderWidth: 1,
                    borderColor: "#E8F5E9",
                    height: 130,
                    textAlignVertical: "top",
                  }}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor="#9CA3AF"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  returnKeyType="done"
                  editable={!sending}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={sending}
              >
                <View
                  style={{
                    borderRadius: 14,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    backgroundColor: sending ? "#9CA3AF" : "#17381B",
                  }}
                >
                  {sending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Icon name="send" size={18} color="#FFFFFF" />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: "#FFFFFF",
                        }}
                      >
                        Submit Ticket
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}