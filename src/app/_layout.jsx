import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="language" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="support"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/categories"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/services"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/details"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/datetime"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/summary"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/workers"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/worker-detail"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/confirm"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/success"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="booking/accepted"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/arrived"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/work-otp"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/in-progress"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/completed"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/payment"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/invoice"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/rating"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="booking/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="booking/form"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
