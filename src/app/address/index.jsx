import React, { useState, useCallback } from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,StatusBar,ActivityIndicator,Alert} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import {getMyAddresses,deleteAddress,setDefaultAddress} from '../../../services/api/address';

export default function AddressListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getMyAddresses({ page: 1, limit: 50 });
      setAddresses(res.data.items || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            fetchAddresses();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      Alert.alert('Error', 'Failed to set default');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F8EF' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#17381B" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="map-pin" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptyText}>
                Add an address to start booking services.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.iconWrap}>
                  <Icon
                    name={item.label === 'Home' ? 'home' : 'briefcase'}
                    size={18}
                    color="#17381B"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={styles.label}>{item.label || 'Address'}</Text>
                    {item.isDefault && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.line} numberOfLines={2}>
                    {item.addressLine}
                  </Text>
                  {item.recipientName && (
                    <Text style={styles.contact}>
                      {item.recipientName} · {item.recipientMobile}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                {!item.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(item.id)}
                    style={styles.actionBtn}
                  >
                    <Icon name="check-circle" size={14} color="#16A34A" />
                    <Text style={styles.actionText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: '/address/edit', params: { id: item.id } })
                  }
                  style={styles.actionBtn}
                >
                  <Icon name="edit-2" size={14} color="#17381B" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.actionBtn}
                >
                  <Icon name="trash-2" size={14} color="#DC2626" />
                  <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.addBtn, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/address/add')}
      >
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Add New Address</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  line: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  contact: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#16A34A' },
  actions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 12,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700', color: '#17381B' },
  addBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#17381B',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});