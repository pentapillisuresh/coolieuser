import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { COLORS, WALLET } from "../../data/dummy";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("transactions");

  const handleAddMoney = () =>
    Alert.alert("Add Money", "UPI / Card options will appear here");
  const handleCopyPromo = (code) =>
    Alert.alert("Copied!", `Promo code ${code} copied to clipboard`);

  const TxRow = ({ tx }) => {
    const isCredit = tx.type === "credit";
    return (
      <View
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
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          {isCredit ? (
            <Icon name="arrow-down-left" size={20} color="#16A34A" />
          ) : (
            <Icon name="arrow-up-right" size={20} color="#DC2626" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1F2937" }}>
            {tx.title}
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            {tx.subtitle} · {tx.date}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: isCredit ? "#16A34A" : "#DC2626",
          }}
        >
          {isCredit ? "+" : "-"}₹{tx.amount}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Balance Hero ── */}
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
            My Wallet
          </Text>

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
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
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "600",
                  letterSpacing: 1,
                }}
              >
                KOOLI WALLET BALANCE
              </Text>
              <Icon3 name="wallet" size={20} color="rgba(255,255,255,0.5)" />
            </View>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -1,
              }}
            >
              ₹{WALLET.balance.toFixed(2)}
            </Text>

            {/* Coins */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,179,0,0.2)",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Icon2 name="emoji-events" size={16} color="#FFD700" />
                <Text
                  style={{ color: "#FFD700", fontWeight: "700", fontSize: 13 }}
                >
                  {WALLET.coins} Coins
                </Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                = ₹{Math.floor(WALLET.coins * 0.1)}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={handleAddMoney}
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  paddingVertical: 13,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Icon name="plus" size={18} color="#17381B" strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "#17381B",
                  }}
                >
                  Add Money
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 14,
                  paddingVertical: 13,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Icon name="share-2" size={18} color="#FFFFFF" />
                <Text
                  style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {[
              { label: "Total Spent", value: "₹1,160", icon: "trending-down", color: "#F87171" },
              { label: "Total Saved", value: "₹380", icon: "trending-up", color: "#34D399" },
              { label: "Cashback", value: "₹150", icon: "gift", color: "#FBBF24" },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Icon3 name={stat.icon} size={18} color={stat.color} />
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
                    textAlign: "center",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Section Toggle ── */}
        <View
          style={{
            marginTop: -20,
            marginHorizontal: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            flexDirection: "row",
            padding: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {["transactions", "promos"].map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => setActiveSection(sec)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor:
                  activeSection === sec ? "#17381B" : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: activeSection === sec ? "#FFFFFF" : "#6B7280",
                }}
              >
                {sec === "transactions" ? "Transactions" : "Promo Codes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === "transactions" ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginTop: 16,
              borderRadius: 20,
              marginHorizontal: 0,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#F3F8EF",
              }}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#1F2937" }}
              >
                Transaction History
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#17381B",
                    fontWeight: "600",
                  }}
                >
                  Filter
                </Text>
              </TouchableOpacity>
            </View>
            {WALLET.transactions.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
            {WALLET.promos.map((promo) => (
              <View
                key={promo.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: promo.used ? "#F0F2F5" : "#E8F5E9",
                  borderStyle: promo.used ? "solid" : "dashed",
                  opacity: promo.used ? 0.6 : 1,
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
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: promo.used ? "#F3F4F6" : "#E8F5E9",
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "900",
                        color: promo.used ? "#6B7280" : "#17381B",
                        letterSpacing: 1,
                      }}
                    >
                      {promo.code}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "900",
                      color: promo.used ? "#6B7280" : "#2ECC71",
                    }}
                  >
                    {promo.discount}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}
                >
                  {promo.desc}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                    Expires: {promo.expiry}
                  </Text>
                  {promo.used ? (
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#6B7280",
                        }}
                      >
                        Used
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleCopyPromo(promo.code)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        backgroundColor: "#E8F5E9",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Icon name="copy" size={12} color="#17381B" />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#17381B",
                        }}
                      >
                        Copy
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Referral card - No Gradient */}
        <TouchableOpacity
          style={{ margin: 20, borderRadius: 20, overflow: "hidden" }}
          activeOpacity={0.9}
        >
          <View
            style={{
              backgroundColor: "#17381B",
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginBottom: 4,
                }}
              >
                🎁 Invite Friends & Earn
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 20,
                }}
              >
                Earn ₹100 wallet credit for every successful referral!
              </Text>
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon name="tag" size={14} color="#FFFFFF" />
                <Text
                  style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}
                >
                  Your Code: ARJUN100
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}