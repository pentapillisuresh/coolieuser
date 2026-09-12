import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import polyline from '@mapbox/polyline';
import { socketService } from '../../services/websocket/socket';
import { getRoute } from '../../services/api/location';

export default function LiveTrackingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const bookingId = Number(params.bookingId);
  const userLat = Number(params.userLat);
  const userLng = Number(params.userLng);

  const [workerLoc, setWorkerLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [eta, setEta] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    socketService.connect();
    socketService.joinBooking(bookingId);

    const unsub = socketService.on('worker-location', async (data) => {
      if (data.bookingId !== bookingId) return;

      const wLoc = { latitude: data.latitude, longitude: data.longitude };
      setWorkerLoc(wLoc);
      setLoading(false);

      // Fit map to show both markers
      mapRef.current?.fitToCoordinates(
        [wLoc, { latitude: userLat, longitude: userLng }],
        { edgePadding: { top: 100, right: 60, bottom: 260, left: 60 }, animated: true }
      );

      // Fetch route + distance + ETA
      try {
        const routeRes = await getRoute(
          wLoc.latitude,
          wLoc.longitude,
          userLat,
          userLng
        );
        const routeData = routeRes.data;
        const decoded = polyline.decode(routeData.polyline).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(decoded);
        setDistance(routeData.distance.text);
        setEta(routeData.duration.text);
      } catch (err) {
        console.warn('Route fetch failed:', err);
      }
    });

    return () => {
      unsub();
      socketService.leaveBooking(bookingId);
    };
  }, [bookingId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: userLat,
          longitude: userLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User marker */}
        <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="You">
          <View style={styles.userMarker}>
            <Icon name="user" size={16} color="#fff" />
          </View>
        </Marker>

        {/* Worker marker */}
        {workerLoc && (
          <Marker coordinate={workerLoc} title="Worker">
            <View style={styles.workerMarker}>
              <Icon name="truck" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#17381B"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom info card */}
      <View style={[styles.card, { paddingBottom: insets.bottom + 16 }]}>
        {loading || !workerLoc ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#17381B" />
            <Text style={styles.waitingText}>Waiting for worker location...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cardTitle}>Worker is on the way</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Icon name="navigation" size={18} color="#17381B" />
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{distance || '--'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Icon name="clock" size={18} color="#17381B" />
                <Text style={styles.infoLabel}>ETA</Text>
                <Text style={styles.infoValue}>{eta || '--'}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#17381B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  workerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoBox: {
    flex: 1,
    backgroundColor: '#F3F8EF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: { fontSize: 11, color: '#6B7280' },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  waitingText: { marginTop: 10, color: '#6B7280' },
});