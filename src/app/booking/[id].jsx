import { useLocalSearchParams } from "expo-router";
import { Redirect } from "expo-router";
import { CATEGORIES } from "../../data/dummy";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const cat = CATEGORIES.find((c) => c.id === id);
  if (cat) {
    return (
      <Redirect
        href={{
          pathname: "/booking/services",
          params: { categoryId: id, categoryName: cat.name },
        }}
      />
    );
  }
  return <Redirect href="/booking/categories" />;
}
