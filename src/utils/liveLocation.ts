// src/utils/liveLocation.js
import * as Location from "expo-location";

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        console.warn("Location permission denied");
        return null;
      }
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.warn("Location services disabled");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (error:any) {
    console.warn("getCurrentLocation error:", error.message);
    return null;   // ✅ never throw
  }
};