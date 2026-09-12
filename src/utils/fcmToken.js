import messaging from '@react-native-firebase/messaging';

async function getFcmToken() {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('❌ Notification permission not granted');
      return null;
    }

    const token = await messaging().getToken();

    console.log('🔥 FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.error('❌ Failed to get FCM token:', error);
    return null;
  }
}

export default getFcmToken;
