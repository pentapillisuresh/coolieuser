import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/FontAwesome5";
import { getPaymentHistory } from "../../../services/api/payment";
import { getActivePromotions } from "../../../services/api/promotions";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("transactions");

  const [transactions, setTransactions] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ─── Fetch both APIs ─────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [paymentsRes, promosRes] = await Promise.all([
        getPaymentHistory({ page: 1, limit: 50 }),
        getActivePromotions({ page: 1, limit: 50 }),
      ]);

      // Payments: { success, data: { items: [...] } }
      const paymentItems =
        paymentsRes?.data?.items ||
        paymentsRes?.items ||
        (Array.isArray(paymentsRes?.data) ? paymentsRes.data : []);

      // Promotions: { success, data: { items: [...] } }
      const promoItems =
        promosRes?.data?.items ||
        promosRes?.items ||
        (Array.isArray(promosRes?.data) ? promosRes.data : []);

      setTransactions(Array.isArray(paymentItems) ? paymentItems : []);
      setPromos(Array.isArray(promoItems) ? promoItems : []);
    } catch (err) {
      console.error("Wallet fetch error:", err);
      setError(err?.error || err?.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // ─── Computed totals ─────────────────────────────────────
  const totalSpent = transactions.reduce((sum, tx) => {
    const amt = parseFloat(tx?.Booking?.totalAmount || tx?.amount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const totalSaved = transactions.reduce((sum, tx) => {
    const disc = parseFloat(tx?.Booking?.discountAmount || 0);
    return sum + (isNaN(disc) ? 0 : disc);
  }, 0);

  // "Balance" = credit held — since we don't have wallet credit yet, show 0
  // Or: treat as pending refunds (not implemented). Show ₹0 for now.
  const walletBalance = 0;

  const handleAddMoney = () =>
    Alert.alert("Add Money", "UPI / Card options will appear here");

  const handleCopyPromo = (code) =>
    Alert.alert("Copied!", `Promo code ${code} copied to clipboard`);

  // ─── Format promo discount for display ───────────────────
  const formatPromoDiscount = (promo) => {
    const val = parseFloat(promo.discountValue || 0);
    if (promo.discountType === "percentage") {
      return `${val}% OFF`;
    }
    return `₹${val} OFF`;
  };

  // ─── Format date safely ─────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // ─── Transaction row ─────────────────────────────────────
  const TxRow = ({ tx }) => {
    const booking = tx.Booking || {};
    const details = booking.details || {};

    // A "paid" payment means customer spent money (debit)
    const isCredit = tx.status === "refunded"; // refunded = money returned = credit
    const title =
      details.serviceName || booking.Service?.name || "Service Payment";
    const subtitle =
      details.categoryName || booking.Service?.Category?.name || "Payment";
    const date = formatDate(tx.paidAt || tx.createdAt);
    const amount = parseFloat(booking.totalAmount || tx.amount || 0);

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
          <Text
            style={{ fontSize: 15, fontWeight: "700", color: "#1F2937" }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
            numberOfLines={1}
          >
            {subtitle} · {date}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: isCredit ? "#16A34A" : "#DC2626",
          }}
        >
          {isCredit ? "+" : "-"}₹{amount.toFixed(0)}
        </Text>
      </View>
    );
  };

  // ─── Loading state ───────────────────────────────────────
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
          Loading wallet...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

          {/* <View
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
                COOLI WALLET BALANCE
              </Text>
              <Icon3
                name="wallet"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </View>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -1,
              }}
            >
              ₹{walletBalance.toFixed(2)}
            </Text>
          </View> */}

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {[
              {
                label: "Total Spent",
                value: `₹${totalSpent.toFixed(0)}`,
                icon: TrendingDown,
                color: "#F87171",
              },
              {
                label: "Total Saved",
                value: `₹${totalSaved.toFixed(0)}`,
                icon: TrendingUp,
                color: "#34D399",
              },
            ].map((stat, i) => {
              const IconComponent = stat.icon;

              return (
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
                  <IconComponent
                    size={18}
                    color={stat.color}
                    strokeWidth={2.5}
                  />

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
              );
            })}
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

        {/* ── Error banner ── */}
        {error && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#FEE2E2",
              borderWidth: 1,
              borderColor: "#FCA5A5",
            }}
          >
            <Text style={{ color: "#991B1B", fontSize: 12 }}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Transactions Section ── */}
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
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                {transactions.length} record
                {transactions.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {transactions.length === 0 ? (
              <View
                style={{
                  padding: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon2 name="receipt-long" size={40} color="#D1D5DB" />
                <Text
                  style={{ marginTop: 8, color: "#6B7280", fontSize: 13 }}
                >
                  No transactions yet
                </Text>
              </View>
            ) : (
              transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
            )}
          </View>
        ) : (
          /* ── Promo Codes Section ── */
          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
            {promos.length === 0 ? (
              <View
                style={{
                  padding: 40,
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                }}
              >
                <Icon name="tag" size={40} color="#D1D5DB" />
                <Text
                  style={{ marginTop: 8, color: "#6B7280", fontSize: 13 }}
                >
                  No promo codes available
                </Text>
              </View>
            ) : (
              promos.map((promo) => {
                // Check if current user has used this promo
                // Best effort — replace with actual user's mobile from context if needed
                const hasBeenUsed = (promo.couponUsedUsers || []).length > 0;

                return (
                  <View
                    key={promo.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 18,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: hasBeenUsed ? "#F0F2F5" : "#E8F5E9",
                      borderStyle: hasBeenUsed ? "solid" : "dashed",
                      opacity: hasBeenUsed ? 0.6 : 1,
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
                          backgroundColor: hasBeenUsed
                            ? "#F3F4F6"
                            : "#E8F5E9",
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "900",
                            color: hasBeenUsed ? "#6B7280" : "#17381B",
                            letterSpacing: 1,
                          }}
                        >
                          {promo.code}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "900",
                          color: hasBeenUsed ? "#6B7280" : "#2ECC71",
                        }}
                      >
                        {formatPromoDiscount(promo)}
                      </Text>
                    </View>

                    {promo.title ? (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#1F2937",
                          marginBottom: 4,
                        }}
                      >
                        {promo.title}
                      </Text>
                    ) : null}

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 10,
                      }}
                    >
                      {promo.description || "Special offer"}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                        Expires: {formatDate(promo.endDate)}
                      </Text>

                      {hasBeenUsed ? (
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
                );
              })
            )}
          </View>
        )}

        {/* Referral card */}
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
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: "#FFFFFF",
                  }}
                >
                  Your Code: ARJUN100
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-right"
              size={24}
              color="rgba(255,255,255,0.6)"
            />
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}