import { useEffect, useRef } from "react";
import { View, ImageBackground, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Dots animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate dots in sequence
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };
    
    animateDots();

    // Navigate after 2.8s
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const dotScale = (value) => value.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.2],
  });

  return (
    <ImageBackground
      source={require("../../assets/images/splash.jpg")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: insets.top,
      }}
      resizeMode="cover"
    >
      {/* Circular dots loading */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 50,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.25)",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 30,
        }}
      >
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#17381B",
              transform: [{ scale: dotScale(dot) }],
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            }}
          />
        ))}
      </View>
    </ImageBackground>
  );
}