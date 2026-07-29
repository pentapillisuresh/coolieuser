import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { COLORS, FAQ } from "../data/dummy";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Required", "Please enter your message");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubject("");
      setMessage("");
      Alert.alert(
        "Ticket Raised!",
        "Our support team will respond within 24 hours. Ticket ID: #KL7823",
      );
    }, 1200);
  };

  const QUICK_ACTIONS = [
    {
      icon: "message-circle",
      label: "Live Chat",
      sub: "Instant reply",
      color: "#17381B",
      bg: "#E8F5E9",
      onPress: () => Alert.alert("Live Chat", "Connecting to support agent..."),
    },
    {
      icon: "phone",
      label: "Call Support",
      sub: "9AM – 9PM",
      color: "#16A34A",
      bg: "#DCFCE7",
      onPress: () => Alert.alert("Call Us", "Dialing 1800-KOOLI..."),
    },
    {
      icon: "mail",
      label: "Email Us",
      sub: "Response in 24hr",
      color: "#2ECC71",
      bg: "#F3F8EF",
      onPress: () => Alert.alert("Email", "Opening email client..."),
    },
    {
      icon: "help-circle",
      label: "Help Center",
      sub: "Guides & tips",
      color: "#7C3AED",
      bg: "#EDE9FE",
      onPress: () => {},
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header - No Gradient */}
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
          <View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF" }}>
              Help & Support
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              We're here 24/7 for you
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
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

        {/* FAQ */}
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
          {FAQ.map((faq) => {
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
                    {faq.q}
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
                    {isOpen ? (
                      <Icon name="chevron-up" size={16} color="#FFFFFF" />
                    ) : (
                      <Icon name="chevron-down" size={16} color="#6B7280" />
                    )}
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
                    {faq.a}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
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
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginBottom: 8,
                }}
              >
                Subject
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
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginBottom: 8,
                }}
              >
                Message
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
              />
            </View>

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
                  backgroundColor: "#17381B",
                }}
              >
                <Icon name="send" size={18} color="#FFFFFF" />
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}
                >
                  {sending ? "Submitting..." : "Submit Ticket"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}