import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import { getCategories } from "../../../services/api/categories";

// ─── Emoji mapping ──────────────────────────────────────────────
const categoryEmojiMap = {
  Venus: "💆‍♀️",
  Mars: "💇‍♂️",
  Wrench: "🔧",
  Sparkles: "✨",
  Hammer: "🔨",
  PaintRoller: "🎨",
  TrainFront: "🚆",
  Package: "📦",
  Construction: "🏗️",
  Truck: "🚚",
  Droplet: "💧",
  Sprout: "🌱",
  Tractor: "🚜",
};

// ─── Pastel color palette ──────────────────────────────────────
const pastelColors = [
  "#E8F5E9", // green
  "#FFF3E0", // orange
  "#E3F2FD", // blue
  "#F3E5F5", // purple
  "#FBE9E7", // red
  "#E0F7FA", // cyan
  "#FFF8E1", // yellow
  "#F1F8E9", // light green
  "#FCE4EC", // pink
  "#E8EAF6", // indigo
  "#F5F5F5", // grey
  "#E0F2F1", // teal
];

const getCategoryColor = (id) => {
  return pastelColors[id % pastelColors.length] || "#E8F5E9";
};

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F8EF" }}>
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F8EF" }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header - No Gradient */}
      <View
        style={{
          backgroundColor: "#17381B",
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 28,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
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
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#FFFFFF",
              flex: 1,
            }}
          >
            All Categories
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 14,
            paddingHorizontal: 16,
            height: 50,
            gap: 10,
          }}
        >
          <Icon name="search" size={18} color="#6B7280" />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: "#1F2937" }}
            placeholder="Search categories..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#9CA3AF",
            letterSpacing: 1,
            marginBottom: 4,
            marginLeft: 4,
          }}
        >
          ALL SERVICES ({filteredCategories.length})
        </Text>

        {filteredCategories.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              padding: 30,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}>
              No categories found
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              Try adjusting your search
            </Text>
          </View>
        ) : (
          filteredCategories.map((cat) => {
            const emoji = categoryEmojiMap[cat.icon] || "🛠️";
            const bgColor = getCategoryColor(cat.id);

            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() =>
                  router.push({
                    pathname: "/booking/services",
                    params: { categoryId: cat.id.toString(), categoryName: cat.name },
                  })
                }
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.07,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    backgroundColor: bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}
                  >
                    {cat.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                    Tap to explore services →
                  </Text>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: bgColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="chevron-right" size={18} color="#17381B" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}