import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Globe } from "lucide-react-native";
import { COLORS, LANGUAGES } from "../data/dummy";

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("en");

  const handleContinue = () => {
    router.push("/onboarding");
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F3F4F6", paddingTop: insets.top }}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0F2660", "#1A3C8F", "#2952B3"]}
        style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Globe size={32} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: 0.5,
            }}
          >
            Choose Language
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Select your preferred language{"\n"}to continue
          </Text>
        </View>
      </LinearGradient>

      {/* Language Cards */}
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 0, gap: 12 }}
        style={{ marginTop: -24, flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Raised card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {LANGUAGES.map((lang, idx) => {
            const isSelected = selected === lang.id;
            const isLast = idx === LANGUAGES.length - 1;
            return (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setSelected(lang.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: isSelected ? "#EFF4FF" : "transparent",
                  marginBottom: isLast ? 0 : 4,
                }}
              >
                {/* Flag */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: isSelected ? "#DBEAFE" : "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{lang.flag}</Text>
                </View>

                {/* Names */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: isSelected ? COLORS.primary : COLORS.dark,
                    }}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: COLORS.gray, marginTop: 2 }}
                  >
                    {lang.native}
                  </Text>
                </View>

                {/* Check */}
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: isSelected
                      ? COLORS.primary
                      : "transparent",
                    borderWidth: isSelected ? 0 : 2,
                    borderColor: "#D1D5DB",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 20,
          paddingTop: 12,
        }}
      >
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.accent, "#FF8C55"]}
            style={{
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: 0.5,
              }}
            >
              Continue in {LANGUAGES.find((l) => l.id === selected)?.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
