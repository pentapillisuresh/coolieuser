import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { WORKERS } from "../../data/dummy";

const QUICK_TAGS = [
  "Professional",
  "On Time",
  "Clean Work",
  "Polite",
  "Skilled",
  "Careful",
  "Fast",
];

export default function RatingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const worker =
    WORKERS.find((w) => w.name === params.workerName) || WORKERS[0];
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const STAR_LABELS = [
    "",
    "Poor",
    "Below Average",
    "Average",
    "Good",
    "Excellent",
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    if (!rating) {
      Alert.alert("Required", "Please select a rating");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Thank You! 🎉",
        "Your review helps us improve our services.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/home") }],
      );
    }, 1200);
  };

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
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#FFFFFF",
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          Rate Your Experience
        </Text>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
          Help others by sharing your feedback
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
      >
        {/* Worker card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#17381B",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#F59E0B",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32, color: "#FFFFFF" }}>
              {worker.name.charAt(0)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            {worker.name}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>
            {params.serviceName || "Fan Installation"}
          </Text>

          {/* Stars */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 24,
              marginBottom: 10,
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHoveredStar(star)}
                onPressOut={() => setHoveredStar(0)}
                activeOpacity={0.7}
              >
                <Icon2
                  name="star"
                  size={44}
                  color={
                    star <= (hoveredStar || rating) ? "#F59E0B" : "#E5E7EB"
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  rating >= 4
                    ? "#16A34A"
                    : rating >= 3
                      ? "#D97706"
                      : "#DC2626",
              }}
            >
              {STAR_LABELS[rating]}
            </Text>
          )}
        </View>

        {/* Quick tags */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 14,
            }}
          >
            What did you like?
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {QUICK_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    backgroundColor: selected ? "#17381B" : "#F3F8EF",
                    borderWidth: selected ? 0 : 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: selected ? "#FFFFFF" : "#374151",
                    }}
                  >
                    {selected ? "✓ " : ""}
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Review text */}
        <View
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: 20, 
            padding: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 12,
            }}
          >
            Write a Review
          </Text>
          <TextInput
            style={{
              backgroundColor: "#F3F8EF",
              borderRadius: 14,
              padding: 16,
              fontSize: 14,
              color: "#1F2937",
              borderWidth: 1.5,
              borderColor: review ? "#17381B" : "#E5E7EB",
              height: 120,
              textAlignVertical: "top",
              lineHeight: 22,
            }}
            placeholder="Share your experience with other users..."
            placeholderTextColor="#9CA3AF"
            value={review}
            onChangeText={setReview}
            multiline
          />
          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              marginTop: 6,
              textAlign: "right",
            }}
          >
            {review.length}/300
          </Text>
        </View>

        {/* Tips */}
        <View
          style={{ 
            backgroundColor: "#E8F5E9", 
            borderRadius: 16, 
            padding: 14,
            borderWidth: 1,
            borderColor: "#17381B",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="info" size={16} color="#17381B" />
            <Text
              style={{ fontSize: 13, color: "#374151", lineHeight: 22, flex: 1 }}
            >
              Honest reviews help workers improve and help customers make
              better decisions. Your feedback is valuable!
            </Text>
          </View>
        </View>

        {/* Submit - No Gradient */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting || !rating}
        >
          <View
            style={{
              borderRadius: 50,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: rating > 0 ? "#17381B" : "#9CA3AF",
              shadowColor: rating > 0 ? "#17381B" : "#9CA3AF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={{ alignItems: "center", paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>
            Skip for now
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}