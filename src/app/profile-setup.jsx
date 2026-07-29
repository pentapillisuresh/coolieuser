import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, User, Mail, ArrowRight, Check } from "lucide-react-native";
import {uploadSingleFile} from '../../services/api/upload'
const { height } = Dimensions.get("window");
import {updateProfile} from '../../services/api/user'
export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Request permission and pick image
  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload a profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera to take a profile photo."
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  // Show options for photo upload
  const handleAvatarPress = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Gallery", onPress: handlePickImage },
        ...(avatar ? [{ text: "Remove Photo", onPress: () => setAvatar(null), style: "destructive" }] : []),
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
  
    setSaving(true);
    let uploadedImageUrl = null;
  
    try {
      // 1. Upload image if a new one was selected (local file)
      if (avatar && avatar.startsWith('file://')) {
        setUploadingImage(true);
        const file = {
          uri: avatar,
          name: 'profile.jpg',
          type: 'image/jpeg',
        };
        const uploadResponse = await uploadSingleFile(file);
        if (uploadResponse.success && uploadResponse.data?.fullUrl) {
          uploadedImageUrl = uploadResponse.data.fullUrl;
        } else {
          throw new Error('Image upload failed');
        }
        setUploadingImage(false);
      } else if (avatar === null) {
        // User removed avatar – set to null to clear it
        uploadedImageUrl = null;
      } else {
        // Avatar is already a remote URL (from previous save)
        uploadedImageUrl = avatar;
      }
  
      // 2. Update profile (only name and profileImage)
      const updateData = {
        name: name.trim(),
      };
      
      if (email) {
        updateData.email = email.trim();
      }
      
      if (uploadedImageUrl !== null) {
        updateData.profileImage = uploadedImageUrl;
      }
      
      if (uploadedImageUrl !== undefined) {
        updateData.profileImage = uploadedImageUrl;
      }
  
      // Call the update API
      const response = await updateProfile(updateData);
      // if (response.success && response.data) {
      //   if (setUser) setUser(response.data);
      // }
  
      Alert.alert('Success', 'Profile updated successfully');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };
  const handleSkip = () => router.replace("/(tabs)/home");

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Half Screen Image - No gap at top */}
      <ImageBackground
        source={require("../../assets/images/loginbg1.jpg")}
        style={{
          height: height * 0.35,
          width: "100%",
        }}
        resizeMode="cover"
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: "rgba(0,0,0,0.3)",
        }} />
      </ImageBackground>

      {/* Form */}
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
          {/* Title in Form */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            Setup Your Profile 🎉
          </Text>
        

          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
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
              {/* Camera badge */}
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
              Tap to add profile photo (optional)
            </Text>
          </View>

          {/* Name Field */}
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
              <User
                size={20}
                color={name ? "#17381B" : "#9CA3AF"}
              />
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

          {/* Email Field */}
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
              <Mail
                size={20}
                color={email ? "#17381B" : "#9CA3AF"}
              />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: "#1F2937" }}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {email.includes("@") && (
                <Check size={18} color="#2ECC71" />
              )}
            </View>
          </View>

          {/* Save Button - Rounded */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
            <View
              style={{
                borderRadius: 50,
                paddingVertical: 16,
                backgroundColor: "#17381B",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                borderWidth: 2,
                borderColor: "#2ECC71",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}
              >
                {saving ? "Setting up..." : "Save & Continue"}
              </Text>
              {!saving && (
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </View>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            onPress={handleSkip}
            style={{ alignItems: "center", marginTop: 18 }}
          >
            <Text
              style={{ fontSize: 15, color: "#6B7280", fontWeight: "600" }}
            >
              Skip for now →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}