import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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

  const navigation = useNavigation<LeaveScreenNavigationProp>();

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

  const handleLeaveRequest = () => {
    navigation.navigate('AddLeave');
  };

  const handleLeaveHistory = () => {
    navigation.navigate('LeaveHistory');
  };

  const getStatusColor = (status: string) => {
    if (status === 'Accepted') return '#16a34a';
    if (status === 'Rejected') return '#dc2626';
    return '#f59e0b';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity style={styles.topButton} onPress={handleLeaveRequest}>
          <Text style={styles.topButtonText}>Leave Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleLeaveHistory}>
          <Text style={styles.topButtonText}>Leave History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={{ marginTop: 40 }}
        />
      ) : leaveHistory.length === 0 ? (
        <Text style={styles.noDataText}>No Leave Applications Found</Text>
      ) : (
        leaveHistory.map(item => (
          <View key={item.id} style={styles.card}>
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
        ))
      )}
    </ScrollView>
  );
};

export default LeaveHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  topButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 20,
  },

  topButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  leaveType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontWeight: '600',
    color: '#475569',
  },

  value: {
    color: '#1e293b',
  },

  status: {
    fontWeight: 'bold',
  },

  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
  },
});