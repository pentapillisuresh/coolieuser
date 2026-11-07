import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ImageBackground, Dimensions, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, User, Mail, ArrowRight, Check } from "lucide-react-native";
import { uploadSingleFile, getSignedReadUrl, extractPathFromUrl } from "../../services/api/upload";
import { getProfile, updateProfile } from "../../services/api/user";
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get("window");

export default function UpdateUserProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ─── Form state ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null); // local file URI OR signed URL

  // ─── Loading / status ────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Profile fetch ───────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await getProfile();
      const user = res?.data?.user || res?.data || res?.user || res;
      if (!user) throw new Error("No profile found");

      // Prefill name & email
      setName(user.name || "");
      setEmail(user.email || "");

      // Handle profile image
      if (user.profileImage) {
        // user.profileImage is a full GCS URL like:
        // https://storage.googleapis.com/coolie_bucket/images/xxx.webp
        const path = extractPathFromUrl(user.profileImage);
        console.log("rrr::", path)
        if (path) {
          try {
            const signed = await getSignedReadUrl(path);
            setAvatar(signed?.url || user.profileImage);
          } catch (signedErr) {
            console.warn("Signed URL failed, using raw URL:", signedErr);
            setAvatar(user.profileImage);
          }
        } else {
          setAvatar(user.profileImage);
        }
      } else {
        setAvatar(null);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(err?.error || err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Image pickers ──────────────────────────────────────
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAvatar(result.assets[0].uri); // local file:// URI
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Gallery", onPress: handlePickImage },
        ...(avatar
          ? [
            {
              text: "Remove Photo",
              onPress: () => setAvatar(null),
              style: "destructive",
            },
          ]
          : []),
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // ─── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your full name");
      return;
    }

    setSaving(true);
    let uploadedImageUrl;

    try {
      // 1. If avatar is a NEW local file, upload it
      if (avatar && avatar.startsWith("file://")) {
        setUploadingImage(true);
        const file = {
          uri: avatar,
          type: "image/jpeg",
          name: `profile_${Date.now()}.jpg`,
        };

        const uploadResponse = await uploadSingleFile(file);

        if (uploadResponse?.success && uploadResponse?.data?.fullUrl) {
          uploadedImageUrl = uploadResponse.data.fullUrl;
        } else {
          throw new Error(uploadResponse?.error || "Image upload failed");
        }
        setUploadingImage(false);
      } else if (avatar === null) {
        // User removed the photo → send null to clear
        uploadedImageUrl = null;
      }
      // If avatar is already a signed URL (unchanged), we don't resend it

      // 2. Build update payload
      const updateData = { name: name.trim() };
      if (email.trim()) updateData.email = email.trim();
      if (uploadedImageUrl !== undefined) {
        updateData.profileImage = uploadedImageUrl;
      }

      const response = await updateProfile(updateData);
      console.log("response::", response.data)
      SecureStore.setItemAsync("userData", JSON.stringify(response?.data));

      Alert.alert("Success", "Profile updated successfully");
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert(
        "Error",
        error?.message || error?.error || "Failed to update profile"
      );
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#17381B" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ImageBackground
        source={require("../../assets/images/loginbg1.jpg")}
        style={{ height: height * 0.35, width: "100%" }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} />
      </ImageBackground>

      <View
        style={{
          flex: 1,
          marginTop: -30,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingHorizontal: 28,
          paddingTop: 24,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            Edit User Profile 🎉
          </Text>

          {error ? (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 6 }}>
              ⚠️ {error}
            </Text>
          ) : null}

          {/* Avatar */}
          <View style={{ alignItems: "center", marginVertical: 28 }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleAvatarPress}>
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: "#E8F5E9",
                  borderWidth: 3,
                  borderColor: "#17381B",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={{ alignItems: "center", gap: 6 }}>
                    <User size={36} color="#17381B" />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#17381B",
                        fontWeight: "600",
                      }}
                    >
                      ADD PHOTO
                    </Text>
                  </View>
                )}
              </View>

              {uploadingImage && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 55,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#2ECC71",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              >
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={{ marginTop: 10, fontSize: 12, color: "#6B7280" }}>
              Tap to change profile photo
            </Text>
          </View>

          {/* Name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 10,
              }}
            >
              Full Name <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#F5F7FA",
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: name ? "#17381B" : "#E5E7EB",
                paddingHorizontal: 18,
                height: 56,
              }}
            >
              <User size={20} color={name ? "#17381B" : "#9CA3AF"} />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: "#1F2937" }}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
              {name.length > 2 && <Check size={18} color="#2ECC71" />}
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#1F2937" }}
              >
                Email Address
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                Optional
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#F5F7FA",
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: email ? "#17381B" : "#E5E7EB",
                paddingHorizontal: 18,
                height: 56,
              }}
            >
              <Mail size={20} color={email ? "#17381B" : "#9CA3AF"} />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: "#1F2937" }}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {email.includes("@") && <Check size={18} color="#2ECC71" />}
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || uploadingImage}
            activeOpacity={0.85}
          >
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 16,
                backgroundColor:
                  saving || uploadingImage ? "#9CA3AF" : "#17381B",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                borderWidth: 2,
                borderColor: "#2ECC71",
              }}
            >
              {saving || uploadingImage ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Save Changes
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </>
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}