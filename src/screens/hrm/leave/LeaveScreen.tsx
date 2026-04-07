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
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from "react-native-svg";

const LeaveRequestIcon = ({ size = 20, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 
    0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 
    1.41-1.41L12 14.17l5.59-5.59L19 10l-7 7z" fill={color}/>
  </Svg>
);

const LeaveHistoryIcon = ({ size = 20, color = "#fff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 3a9 9 0 1 0 8.95 10H20a7 7 0 1 1-2.05-4.95L15 11h7V4l-2.55 2.55A8.96 8.96 0 0 0 13 3z" fill={color}/>
  </Svg>
);

const leaveGroups = [
  { key: 'CL', title: 'Casual Leave', color: '#fb7185', fields: ['EntitledCL','UsedCL','RemainingCL'] },
  { key: 'EL', title: 'Earning Leave', color: '#818cf8', fields: ['EntitledEL','UsedEL','RemainingEL'] },
  { key: 'SL', title: 'Sick Leave', color: '#34d399', fields: ['EntitledSL','UsedSL','RemainingSL'] },
  { key: 'WL', title: 'Without Pay', color: '#facc15', fields: ['EntitledWL','UsedWL','RemainingWL'] },
  { key: 'RL', title: 'Replace Leave', color: '#fbbf24', fields: ['EntitledRL','UsedRL','RemainingRL'] },
  { key: 'ML', title: 'Maternity Leave', color: '#a78bfa', fields: ['EntitledML','UsedML','RemainingML'] },
];

const LeaveScreen = () => {
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const empid = userInfo?.employeeId;
      const yearValue = new Date().getFullYear();

      const url = `${API_ENDPOINTS.HRM.GetEmpLeaveInfo}?empid=${empid}&year=${yearValue}`;
      const res = await get(url);

      setLeaveBalance(res?.data?.balance || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* ACTION BUTTONS */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity style={styles.topButton} onPress={() => navigation.navigate('AddLeave')}>
          <LeaveRequestIcon />
          <Text style={styles.topButtonText}> Leave Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={() => navigation.navigate('LeaveHistory')}>
          <LeaveHistoryIcon />
          <Text style={styles.topButtonText}> Leave History</Text>
        </TouchableOpacity>
      </View>

      {/* BALANCE */}
      <View style={styles.card}>
        {/* <Text style={styles.title}>Leave Balance</Text> */}

        {loading ? (
          <ActivityIndicator size="large" />
        ) : leaveBalance ? (
          leaveGroups.map(group => (
            <View key={group.key} style={styles.leaveCard}>
              
              {/* HEADER */}
              <View style={[styles.leaveHeader, { backgroundColor: group.color }]}>
                <Text style={styles.leaveTitle}>{group.title}</Text>
              </View>

              {/* BODY */}
              <View style={styles.leaveBody}>
                <View style={styles.item}>
                  <Text style={styles.label}>Total</Text>
                  <Text style={styles.value}>{leaveBalance[group.fields[0]]}</Text>
                </View>

                <View style={styles.item}>
                  <Text style={styles.label}>Used</Text>
                  <Text style={styles.value}>{leaveBalance[group.fields[1]]}</Text>
                </View>

                <View style={styles.item}>
                  <Text style={styles.label}>Remaining</Text>
                  <Text style={[styles.value, styles.remaining]}>
                    {leaveBalance[group.fields[2]]}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No leave balance found</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default LeaveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  /* 🔥 TOP BUTTONS */
  topButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginHorizontal: 16,
    gap: 10,
  },

  topButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },

  topButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },

  /* 🔥 MAIN CARD */
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },

  /* 🔥 LEAVE CARD */
  leaveCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },

  leaveHeader: {
    paddingVertical: 10,
  },

  leaveTitle: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* 🔥 BODY */
  leaveBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },

  item: {
    flex: 1,
    alignItems: 'center',
  },

  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },

  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },

  remaining: {
    color: '#16a34a',
  },

  noData: {
    textAlign: 'center',
    marginTop: 30,
    color: '#64748b',
    fontSize: 14,
  },
});