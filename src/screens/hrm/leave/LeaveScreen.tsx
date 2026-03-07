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

// Type for navigation
type RootStackParamList = {
  Leave: undefined;
  AddLeave: undefined;
  LeaveHistory: undefined;
};

type LeaveScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Leave'
>;

const leaveGroups = [
  {
    key: 'CL',
    title: 'Casual Leave',
    gradient: ['#f87171', '#fb7185'],
    fields: ['entitledCL', 'usedCL', 'remainingCL'],
  },
  {
    key: 'EL',
    title: 'Earning Leave',
    gradient: ['#6366f1', '#818cf8'],
    fields: ['entitledEL', 'usedEL', 'remainingEL'],
  },
  {
    key: 'SL',
    title: 'Sick Leave',
    gradient: ['#34d399', '#6ee7b7'],
    fields: ['entitledSL', 'usedSL', 'remainingSL'],
  },
  {
    key: 'WL',
    title: 'Without Pay',
    gradient: ['#facc15', '#fde68a'],
    fields: ['entitledWL', 'usedWL', 'remainingWL'],
  },
  {
    key: 'RL',
    title: 'Replace Leave',
    gradient: ['#fbbf24', '#fde68a'],
    fields: ['entitledRL', 'usedRL', 'remainingRL'],
  },
  {
    key: 'ML',
    title: 'Maternity Leave',
    gradient: ['#a78bfa', '#c4b5fd'],
    fields: ['entitledML', 'usedML', 'remainingML'],
  },
];

const LeaveScreen = () => {
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LeaveScreenNavigationProp>();

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const userId = userInfo?.id;
      const yearValue = new Date().getFullYear();
      const url = `${API_ENDPOINTS.HRM.GetEmpLeaveInfo}?empid=${userId}&year=${yearValue}`;

      const res = await get(url);
      setLeaveBalance(res?.data?.balance || null);
      setLoading(false);
    } catch (error) {
      console.log('Leave Balance Error:', error);
      setLoading(false);
    }
  };

  const handleLeaveRequest = () => {
    navigation.navigate('AddLeave'); // Navigate to Add Leave screen
  };

  const handleLeaveHistory = () => {
    navigation.navigate('LeaveHistory'); // Navigate to Leave History screen
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

      {/* Leave Balance */}
      <View style={styles.card}>
        <Text style={styles.title}>Leave Balance</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : leaveBalance ? (
          leaveGroups.map(group => (
            <View key={group.key} style={styles.groupContainer}>
              {/* Gradient Header */}
              <View
                style={[
                  styles.groupHeader,
                  { backgroundColor: group.gradient[0] },
                ]}
              >
                <Text style={styles.groupTitle}>{group.title}</Text>
              </View>

              {/* Column Headers */}
              <View style={styles.dataRow}>
                <Text style={[styles.cell, styles.columnHeader]}>Leave</Text>
                <Text style={[styles.cell, styles.columnHeader]}>Consumed</Text>
                <Text style={[styles.cell, styles.columnHeader]}>Balance</Text>
              </View>

              {/* Data Row */}
              <View style={styles.dataRow}>
                <Text style={styles.cell}>{leaveBalance[group.fields[0]]}</Text>
                <Text style={styles.cell}>{leaveBalance[group.fields[1]]}</Text>
                <Text style={styles.cell}>{leaveBalance[group.fields[2]]}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No leave balance found</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
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
  topButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1e293b',
  },
  groupContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupHeader: { paddingVertical: 6 },
  groupTitle: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
  },
  cell: { flex: 1, textAlign: 'center', fontSize: 14, color: '#1e293b' },
  columnHeader: { fontWeight: '600', color: '#1f2937' },
  noDataText: { textAlign: 'center', marginTop: 20, color: '#64748b' },
});
