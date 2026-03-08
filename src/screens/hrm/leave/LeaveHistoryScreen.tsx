import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { get, getUserInfo } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  Leave: undefined;
  AddLeave: undefined;
  LeaveHistory: undefined;
};

type LeaveScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Leave'
>;

const LeaveHistoryScreen = () => {
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  //const navigation = useNavigation<LeaveScreenNavigationProp>();

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const userId = userInfo?.id;
      const yearValue = new Date().getFullYear();

      const url = `${API_ENDPOINTS.HRM.GetEmpLeaveInfo}?empid=${userId}&year=${yearValue}`;

      const res = await get(url);
      setLeaveHistory(res?.data?.applications || []);
      setLoading(false);
    } catch (error) {
      console.log('Leave History Error:', error);
      setLoading(false);
    }
  };

  // const handleLeaveRequest = () => {
  //   navigation.navigate('AddLeave');
  // };

  const getStatusColor = (status: string) => {
    if (status === 'Accepted' || status === 'Approved') return '#16a34a';
    if (status === 'Rejected' || status === 'Cancel') return '#dc2626';
    return '#f59e0b'; // Pending
  };

  const filteredData =
    statusFilter === 'All'
      ? leaveHistory
      : leaveHistory.filter(
          item =>
            item.leavestatus?.toLowerCase() === statusFilter.toLowerCase()
        );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.leaveType}>{item.leavetype}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>From</Text>
        <Text style={styles.value}>{item.fromdate}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <Text style={styles.value}>{item.todate}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Reason</Text>
        <Text style={styles.value}>{item.reason}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text
          style={[
            styles.status,
            { color: getStatusColor(item.leavestatus) },
          ]}
        >
          {item.leavestatus}
        </Text>
      </View>
    </View>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const ListHeader = () => (
    <>
      {/* Top Buttons */}
      {/* <View style={styles.topButtonContainer}>
        <TouchableOpacity style={styles.topButton} onPress={handleLeaveRequest}>
          <Text style={styles.topButtonText}>Leave Request</Text>
        </TouchableOpacity>
      </View> */}

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Approved', 'Cancel'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.activeFilter,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#020c1b" />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredData}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingBottom: 30 }}
      ListEmptyComponent={
        <Text style={styles.noDataText}>No Leave Applications Found</Text>
      }
    />
  );
};

export default LeaveHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  topButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 16,
    gap: 10,
  },

  topButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#010611',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },

  topButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginHorizontal: 16,
    gap: 8,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    marginRight: 8,
    marginBottom: 8,
  },

  filterText: {
    fontSize: 13,
    color: '#475569',
  },

  activeFilter: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  activeFilterText: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  leaveType: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: '#64748b',
  },

  value: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },

  status: {
    fontWeight: '600',
  },

  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
  },
});