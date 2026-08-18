import { useState, useRef } from "react";
import {View,Text,TouchableOpacity,ScrollView,Dimensions,Animated,Image} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get("window");

// Replace these with your actual image paths
const IMAGES = [
  require("../../assets/images/board1.png"),
  require("../../assets/images/board2.png"),
  require("../../assets/images/board3.png"),
];

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Book Verified Workers",
    subtitle: "Find trusted professionals anytime, anywhere.",
  },
  {
    id: 2,
    title: "Easy Service Booking",
    subtitle: "Book the right worker for your task in just a few simple steps.",
  },
  {
    id: 3,
    title: "Secure Payments",
    subtitle: "Pay safely after the job is done with multiple payment options.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      const isLogin=SecureStore.getItem("isLogin")
      if (isLogin) {
        router.replace('/(tabs)/home');
      } else {
        router.push("/login");
      }
    } 
  };

  const handleSkip = () => router.push("/login");

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FDFAF7", paddingTop: insets.top }}
    >
      {/* Skip */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 24,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        style={{ flex: 1 }}
      >
        {ONBOARDING_SLIDES.map((slide, idx) => (
          <View
            key={slide.id}
            style={{
              width,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 28,
              paddingTop: 20,
            }}
          >
            {/* Image - Full visible, no border/shape */}
            <View
              style={{
                width: width - 56,
                height: 320,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 48,
                overflow: "hidden",
              }}
            >
              <Image
                source={IMAGES[idx]}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            </View>

            {/* Text */}
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#1F2937",
                textAlign: "center",
                marginBottom: 12,
                lineHeight: 34,
              }}
            >
              {slide.title}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              {slide.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom - Dots and Arrow Button */}
      <View
        style={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 30,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                height: 6,
                borderRadius: 3,
                width: currentIndex === i ? 20 : 6,
                backgroundColor:
                  currentIndex === i ? "#17381B" : "#E5E7EB",
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button with Arrow */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#17381B",
            borderRadius: 50,
            paddingVertical: 16,
            paddingHorizontal: 28,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#FFFFFF",
            }}
          >
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}