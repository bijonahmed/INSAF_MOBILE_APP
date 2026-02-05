import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card, Portal, Dialog, Button, Chip } from 'react-native-paper';

/* ================= TYPES ================= */
type LeaveType = {
  id: number;
  ApplicationDate: string;
  EmployeeName: string;
  EmployeeId: number;
  LeaveType: string;
  LeaveStatus: string;
  LeaveStatusId: number;
  DepartmentName: string;
  JobTitleName: string;
  FromDate: string;
  ToDate: string;
  Reason: string;
  ManagerNote: string | null;
};

/* ================= COMPONENT ================= */
const LeaveScreen = () => {
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= API CALL ================= */
  useEffect(() => {
    setLoading(true);
    fetch(
      'http://45.251.56.104:82/api/Hrleave/GetEmpLeaveApplication?selectedempId=&deptid=-1&month=1&year=2026&status=0',
    )
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setLeaves(json.data);
        }
      })
      .catch(err => console.log('Leave API Error:', err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= DIALOG ================= */
  const showDialog = (item: LeaveType) => {
    setSelectedLeave(item);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setSelectedLeave(null);
  };

  /* ================= LIST ITEM ================= */
  const renderItem = ({ item }: { item: LeaveType }) => (
    <Card style={styles.card} onPress={() => showDialog(item)}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.EmployeeName}</Text>
          <Text style={styles.sub}>
            {item.LeaveType} • {item.DepartmentName}
          </Text>
        </View>

        <Chip
          style={[
            styles.statusChip,
            item.LeaveStatus === 'Pending'
              ? styles.pending
              : styles.approved,
          ]}
          textStyle={styles.statusText}
        >
          {item.LeaveStatus}
        </Chip>
      </View>
    </Card>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <FlatList
        data={leaves}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* 🔹 DETAILS POPUP */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Leave Details</Dialog.Title>
          <Dialog.Content>
            {selectedLeave && (
              <>
                <Text style={styles.detail}>
                  Employee: {selectedLeave.EmployeeName}
                </Text>
                <Text style={styles.detail}>
                  Designation: {selectedLeave.JobTitleName}
                </Text>
                <Text style={styles.detail}>
                  Department: {selectedLeave.DepartmentName}
                </Text>
                <Text style={styles.detail}>
                  Leave Type: {selectedLeave.LeaveType}
                </Text>
                <Text style={styles.detail}>
                  Status: {selectedLeave.LeaveStatus}
                </Text>
                <Text style={styles.detail}>
                  From: {selectedLeave.FromDate.split('T')[0]}
                </Text>
                <Text style={styles.detail}>
                  To: {selectedLeave.ToDate.split('T')[0]}
                </Text>
                <Text style={styles.detail}>
                  Reason: {selectedLeave.Reason}
                </Text>
                {selectedLeave.ManagerNote && (
                  <Text style={styles.detail}>
                    Manager Note: {selectedLeave.ManagerNote}
                  </Text>
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 🔹 DARK LOADER */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading leave list...</Text>
        </View>
      )}
    </View>
  );
};

export default LeaveScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  /* Status */
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
  },
  pending: {
    backgroundColor: '#f97316',
  },
  approved: {
    backgroundColor: '#16a34a',
  },

  /* Dialog */
  detail: {
    fontSize: 14,
    marginBottom: 6,
    color: '#334155',
  },

  /* Loader */
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});
