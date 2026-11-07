import { useState, useEffect, useRef } from "react";
import {View,Text,TextInput,TouchableOpacity,Alert,ActivityIndicator,Modal,Animated,Dimensions,TouchableWithoutFeedback,KeyboardAvoidingView,Platform,ScrollView} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import { geocodeAddress } from "../../services/api/location";
import { updateAddress,createAddress } from "../../services/api/address";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LABELS = ["Home", "Office", "Other"];

export default function AddAddressSheet({
  visible,
  onClose,
  onSuccess,
  editAddress = null, // pass an existing address to edit it
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const isEdit = !!editAddress;

  // ─── Form state ────────────────────────────────────────
  const [label, setLabel] = useState("Home");
  const [addressText, setAddressText] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [geocoded, setGeocoded] = useState(null); // { latitude, longitude, address }

  // ─── Status ────────────────────────────────────────────
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Slide animation ──────────────────────────────────
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // ─── Load data when opening ───────────────────────────
  useEffect(() => {
    if (!visible) return;

    if (isEdit && editAddress) {
      setLabel(editAddress.label || "Home");
      setAddressText(editAddress.address || "");
      setCountry(editAddress.country || "India");
      setIsDefault(!!editAddress.isDefault);
      setGeocoded({
        latitude: editAddress.latitude,
        longitude: editAddress.longitude,
        address: editAddress.address,
      });
    } else {
      // Reset for new address
      setLabel("Home");
      setAddressText("");
      setCountry("India");
      setIsDefault(false);
      setGeocoded(null);
    }
  }, [visible, editAddress, isEdit]);

  // ─── Geocode address ──────────────────────────────────
  const handleGeocode = async () => {
    if (!addressText.trim()) {
      Alert.alert("Required", "Please enter an address");
      return;
    }

    setGeocoding(true);
    try {
      const res = await geocodeAddress(addressText.trim());
      const data = res?.data || res;

      if (!data?.latitude || !data?.longitude) {
        throw new Error("No coordinates found for this address");
      }

      setGeocoded({
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || addressText.trim(),
      });

      // Update the address text to the formatted one from Google
      if (data.address) setAddressText(data.address);

      Alert.alert("Success", "Address location verified!");
    } catch (err) {
      console.error("Geocode error:", err);
      Alert.alert(
        "Could Not Verify",
        err?.error || err?.message || "Please check the address and try again"
      );
    } finally {
      setGeocoding(false);
    }
  };

  // ─── Save address ─────────────────────────────────────
  const handleSave = async () => {
    if (!addressText.trim()) {
      Alert.alert("Required", "Please enter an address");
      return;
    }

    if (!geocoded?.latitude || !geocoded?.longitude) {
      Alert.alert(
        "Verification Required",
        "Please tap 'Verify Location' to confirm the address coordinates."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label,
        address: geocoded.address || addressText.trim(),
        country,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        placeId: geocoded.placeId || null,
        isDefault,
      };

      let response;
      if (isEdit && editAddress?.id) {
        response = await updateAddress(editAddress.id, payload);
      } else {
        response = await createAddress(payload);
      }

      if (response?.success || response?.data) {
        Alert.alert(
          "Success",
          isEdit ? "Address updated" : "Address added successfully"
        );
        onSuccess?.(response?.data || response);
        onClose?.();
      } else {
        throw new Error(response?.error || "Failed to save address");
      }
    } catch (err) {
      console.error("Save address error:", err);
      Alert.alert(
        "Error",
        err?.error || err?.message || "Failed to save address"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const hasCoordinates = !!(geocoded?.latitude && geocoded?.longitude);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={{
                height: SCREEN_HEIGHT * 0.85,
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                transform: [{ translateY }],
              }}
            >
              {/* Drag handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#D1D5DB",
                  alignSelf: "center",
                  marginTop: 10,
                  marginBottom: 4,
                }}
              />

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F8EF",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#1F2937",
                  }}
                >
                  {isEdit ? "Edit Address" : "Add New Address"}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#F3F8EF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="x" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={20}
              >
                <ScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 40,
                  }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* ── Address Type ── */}
                  <Text style={styles.label}>Address Type</Text>
                  <View style={styles.chipRow}>
                    {LABELS.map((lbl) => (
                      <TouchableOpacity
                        key={lbl}
                        onPress={() => setLabel(lbl)}
                        style={[
                          styles.chip,
                          label === lbl && styles.chipActive,
                        ]}
                      >
                        <Icon
                          name={
                            lbl === "Home"
                              ? "home"
                              : lbl === "Office"
                              ? "briefcase"
                              : "map-pin"
                          }
                          size={14}
                          color={label === lbl ? "#FFFFFF" : "#6B7280"}
                        />
                        <Text
                          style={[
                            styles.chipText,
                            label === lbl && styles.chipTextActive,
                          ]}
                        >
                          {lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* ── Address Input ── */}
                  <Text style={[styles.label, { marginTop: 16 }]}>
                    Full Address <Text style={{ color: "#DC2626" }}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        height: 100,
                        alignItems: "flex-start",
                        paddingVertical: 12,
                      },
                    ]}
                  >
                    <Icon
                      name="map-pin"
                      size={18}
                      color={addressText ? "#17381B" : "#9CA3AF"}
                      style={{ marginTop: 2 }}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { height: 76, textAlignVertical: "top" },
                      ]}
                      placeholder="House no., Building, Street, Area, City..."
                      placeholderTextColor="#9CA3AF"
                      value={addressText}
                      onChangeText={(t) => {
                        setAddressText(t);
                        // Invalidate geocode if address changes
                        if (geocoded) setGeocoded(null);
                      }}
                      multiline
                      editable={!saving}
                    />
                  </View>

                  {/* ── Verify Location Button ── */}
                  <TouchableOpacity
                    onPress={handleGeocode}
                    disabled={geocoding || !addressText.trim()}
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: hasCoordinates ? "#DCFCE7" : "#E8F5E9",
                      borderWidth: 1.5,
                      borderColor: hasCoordinates ? "#16A34A" : "#17381B",
                      borderRadius: 12,
                      paddingVertical: 14,
                      opacity: !addressText.trim() ? 0.5 : 1,
                    }}
                  >
                    {geocoding ? (
                      <ActivityIndicator size="small" color="#17381B" />
                    ) : (
                      <Icon2
                        name={
                          hasCoordinates
                            ? "check-circle"
                            : "location-searching"
                        }
                        size={18}
                        color={hasCoordinates ? "#16A34A" : "#17381B"}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: hasCoordinates ? "#16A34A" : "#17381B",
                      }}
                    >
                      {geocoding
                        ? "Verifying..."
                        : hasCoordinates
                        ? "Location Verified ✓"
                        : "Verify Location"}
                    </Text>
                  </TouchableOpacity>

                  {/* ── Coordinates Preview ── */}
                  {hasCoordinates && (
                    <View
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: "#F3F8EF",
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Icon name="crosshair" size={14} color="#17381B" />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "800",
                            color: "#17381B",
                            letterSpacing: 0.5,
                          }}
                        >
                          VERIFIED COORDINATES
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        Latitude: {geocoded.latitude.toFixed(6)}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#374151" }}>
                        Longitude: {geocoded.longitude.toFixed(6)}
                      </Text>
                    </View>
                  )}

                  {/* ── Country ── */}
                  <Text style={[styles.label, { marginTop: 16 }]}>
                    Country
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="globe" size={18} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Country"
                      placeholderTextColor="#9CA3AF"
                      value={country}
                      onChangeText={setCountry}
                      editable={!saving}
                    />
                  </View>

                  {/* ── Set as Default ── */}
                  <TouchableOpacity
                    onPress={() => setIsDefault(!isDefault)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 20,
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: "#17381B",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isDefault ? "#17381B" : "transparent",
                      }}
                    >
                      {isDefault && (
                        <Icon name="check" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1F2937",
                      }}
                    >
                      Set as default address
                    </Text>
                  </TouchableOpacity>

                  {/* ── Save Button ── */}
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving || geocoding || !hasCoordinates}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 24,
                      borderRadius: 14,
                      paddingVertical: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor:
                        saving || !hasCoordinates ? "#9CA3AF" : "#17381B",
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Icon name="check" size={18} color="#FFFFFF" />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: "#FFFFFF",
                          }}
                        >
                          {isEdit ? "Save Changes" : "Save Address"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = {
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#17381B",
    borderColor: "#17381B",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    paddingVertical: 0,
  },
};