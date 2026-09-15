import React, { useEffect, useState } from 'react';
import {View,Text,Modal,TouchableOpacity,FlatList,ActivityIndicator,StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getMyAddresses } from '../services/api/address';

const AddressSelectorModal = ({ visible, onClose, onSelect, selectedId }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch addresses each time modal is opened
  useEffect(() => {
    if (visible) fetchAddresses();
  }, [visible]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getMyAddresses({ page: 1, limit: 50 });
      setAddresses(res.data.items || []);
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (addr) => {
    onSelect(addr);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    router.push('/address/add');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Delivery Address</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Add New Button */}
          <TouchableOpacity style={styles.addNewBtn} onPress={handleAddNew}>
            <View style={styles.addIcon}>
              <Icon name="plus" size={20} color="#17381B" />
            </View>
            <Text style={styles.addNewText}>Add New Address</Text>
            <Icon name="chevron-right" size={18} color="#17381B" />
          </TouchableOpacity>

          {/* List */}
          {loading ? (
            <ActivityIndicator size="large" color="#17381B" style={{ marginTop: 20 }} />
          ) : addresses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Icon name="map-pin" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No saved addresses yet</Text>
            </View>
          ) : (
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.addrCard,
                    selectedId === item.id && styles.addrCardSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.addrIcon}>
                    <Icon
                      name={item.label === 'Home' ? 'home' : 'briefcase'}
                      size={18}
                      color="#17381B"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.addrLabel}>{item.label || 'Address'}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addrText} numberOfLines={2}>
                      {item.addressLine}
                    </Text>
                  </View>
                  {selectedId === item.id && (
                    <Icon name="check-circle" size={20} color="#16A34A" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F8EF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#17381B' },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addrCardSelected: { borderColor: '#17381B', backgroundColor: '#F3F8EF' },
  addrIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrLabel: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  addrText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: { fontSize: 9, fontWeight: '800', color: '#16A34A' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});

export default AddressSelectorModal;