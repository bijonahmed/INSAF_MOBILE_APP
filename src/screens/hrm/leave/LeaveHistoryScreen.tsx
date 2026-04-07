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

const LeaveHistoryScreen = () => {
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const empid = userInfo?.employeeId;
      const yearValue = new Date().getFullYear();

      const url = `${API_ENDPOINTS.HRM.GetEmpLeaveInfo}?empid=${empid}&year=${yearValue}`;
      const res = await get(url);

      setLeaveHistory(res?.data?.applications || []);
    } catch (error) {
      console.log('Leave History Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Status Mapping
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Pending', color: '#f59e0b' };
      case 1:
        return { label: 'Approved', color: '#22c55e' };
      case 2:
        return { label: 'Rejected', color: '#ef4444' };
      default:
        return { label: 'Unknown', color: '#64748b' };
    }
  };

  // ✅ Filter Logic
  const filteredData =
    statusFilter === 'All'
      ? leaveHistory
      : leaveHistory.filter(item => {
          const statusLabel = getStatusInfo(item.LeaveStatusId).label;
          return statusLabel === statusFilter;
        });

  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusInfo(item.LeaveStatusId);

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.leaveType}>{item.leavetype}</Text>

          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        {/* BODY */}

         <View style={styles.row}>
          <Text style={styles.label}>Apply Date</Text>
          <Text style={styles.value}>{item.applicationdate}</Text>
        </View>
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
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.filterContainer}>
      {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
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
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListEmptyComponent={
        <Text style={styles.noDataText}>No Leave Applications Found</Text>
      }
    />
  );
};

export default LeaveHistoryScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginHorizontal: 16,
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
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
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
    marginBottom: 15,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  leaveType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    color: '#64748b',
  },

  value: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },

  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
  },
});