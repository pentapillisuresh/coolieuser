import { Redirect } from "expo-router";
// Date/time selection is handled inside the booking/details screen
export default function DatetimeScreen() {
  return <Redirect href="/booking/categories" />;
}
