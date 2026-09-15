import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,StatusBar,ScrollView,Alert,ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import LocationPickerModal from '../../components/LocationPickerModal';
import {getAddressById,createAddress,updateAddress,
} from '../../../services/api/address';

export default function AddEditAddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params.id ? Number(params.id) : null;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [form, setForm] = useState({
    label: 'Home',
    address: '',
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  // Load existing address for editing
  useEffect(() => {
    if (editingId) fetchAddress();
  }, [editingId]);

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const res = await getAddressById(editingId);
      setForm((p) => ({ ...p, ...res.data }));
    } catch (err) {
      Alert.alert('Error', 'Failed to load address');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handlePickLocation = ({ latitude, longitude, address }) => {
    setForm((p) => ({
      ...p,
      latitude,
      longitude,
      address: address || p.addressLine,
    }));
  };

  const handleSave = async () => {
    if (!form.addressLine || !form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pick a location on the map');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      Alert.alert('Success', editingId ? 'Address updated' : 'Address saved');
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#17381B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F8EF' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingId ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 120 }}>
        {/* Label chips */}
        <View style={styles.section}>
          <Text style={styles.label}>Address Type</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['Home', 'Office', 'Other'].map((lbl) => (
              <TouchableOpacity
                key={lbl}
                onPress={() => update('label', lbl)}
                style={[styles.chip, form.label === lbl && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, form.label === lbl && styles.chipTextActive]}
                >
                  {lbl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Map Picker Button */}
        <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
          <Icon name="map" size={20} color="#17381B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.mapBtnTitle}>
              {form.latitude ? 'Change Location' : 'Pick Location on Map'}
            </Text>
            {form.address ? (
              <Text style={styles.mapBtnSub} numberOfLines={1}>
                {form.address}
              </Text>
            ) : null}
          </View>
          <Icon name="chevron-right" size={20} color="#17381B" />
        </TouchableOpacity>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.label}>Flat / Building / Street</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={form.address}
            onChangeText={(t) => update('address', t)}
            placeholder="Enter address"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        {/* Default Toggle */}
        <TouchableOpacity
          onPress={() => update('isDefault', !form.isDefault)}
          style={styles.defaultRow}
        >
          <View
            style={[styles.checkbox, form.isDefault && styles.checkboxActive]}
          >
            {form.isDefault && <Icon name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.defaultText}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {editingId ? 'Save Changes' : 'Save Address'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showMap}
        onClose={() => setShowMap(false)}
        onSelect={handlePickLocation}
        initialAddress={form.addressLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#17381B',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff' },
  section: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: '#17381B', backgroundColor: '#E8F5E9' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  chipTextActive: { color: '#17381B' },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#17381B',
  },
  mapBtnTitle: { fontSize: 14, fontWeight: '800', color: '#17381B' },
  mapBtnSub: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#17381B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#17381B' },
  defaultText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveBtn: {
    backgroundColor: '#17381B',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});