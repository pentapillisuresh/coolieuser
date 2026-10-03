import React, { useEffect, useRef, useState } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,StatusBar,ActivityIndicator,TextInput,FlatList,Keyboard} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import * as Location from 'expo-location';
import { reverseGeocode, geocodeAddress } from '../../services/api/location';

export default function SelectLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: 17.6868,
    longitude: 83.2185,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markerMoved, setMarkerMoved] = useState(false);

  // Get current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      console.log("rrr::",newRegion)
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      fetchAddress(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await reverseGeocode(lat, lng);
      setAddress(res.data.address);
    } catch (err) {
      setAddress('Unable to fetch address');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChangeComplete = async (newRegion) => {
    setRegion(newRegion);
    if (markerMoved) {
      await fetchAddress(newRegion.latitude, newRegion.longitude);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    try {
      const res = await geocodeAddress(searchQuery);
      const { latitude, longitude, address } = res.data;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      setAddress(address);
      setSuggestions([]);
    } catch (err) {
      alert('Location not found');
    }
  };

  const handleConfirm = () => {
    router.push({
      pathname: '/customer/create-order',
      params: {
        latitude: region.latitude,
        longitude: region.longitude,
        address,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search area, landmark, street..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeStart={() => setMarkerMoved(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Center Marker (pin fixed to map center) */}
      <View pointerEvents="none" style={styles.centerMarker}>
        <Icon name="map-pin" size={48} color="#17381B" />
      </View>

      {/* Address Card */}
      <View style={[styles.addressCard, { paddingBottom: insets.bottom + 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.addressIcon}>
            <Icon name="map-pin" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Deliver to</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#17381B" />
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>
                {address || 'Move the map to select your location'}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          disabled={!address || loading}
        >
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
          <Icon name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  searchWrap: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -48,
    marginLeft: -24,
    zIndex: 5,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#17381B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  addressText: { fontSize: 15, color: '#1F2937', fontWeight: '600', marginTop: 2 },
  confirmBtn: {
    backgroundColor: '#17381B',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});