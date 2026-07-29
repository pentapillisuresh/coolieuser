import * as Location from "expo-location";

export async function getCurrentLocation() {
  // Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    console.log("Location permission denied");
    return;
  }

  // Get current coordinates
  const location = await Location.getCurrentPositionAsync({});

  // Reverse geocode
  const address = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  if (address.length > 0) {
    const place = address[0];

    console.log("City:", place.city);
    console.log("Country:", place.country);

    return {
      city: place.city,
      country: place.country,
    };
  }
}