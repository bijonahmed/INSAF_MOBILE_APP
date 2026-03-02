import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card, Portal, Dialog, Button, Chip } from 'react-native-paper';
import { get } from '../../config/apiHelper';
import { API_ENDPOINTS } from '../../config/apiRoutes';

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

interface Permission {
  id: number;
  value: string;
  isActive: boolean;
}

interface Menu {
  id: number;
  parentId: number;
  name: string;
  title: string;
  treeLevel: number;
  componentKey: string;
  url: string;
  children: Menu[];
  permissionList?: Permission[];
}

interface GetMenusResponse {
  menuItems: Menu[];
}

/* ================= COMPONENT ================= */
const LeaveScreen = () => {
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= API CALL ================= */
  useEffect(() => {
  const fetchMenus = async (): Promise<void> => {
    try {
      setLoading(true);

      const userId: number = 46;

      const response: GetMenusResponse = await get(
        `${API_ENDPOINTS.HRM.GET_MENUS}?userid=${userId}`
      );

      const menus: Menu[] = response?.menuItems ?? [];

      console.log("First :", response);
      // ✅ Only root level
      const topLevelMenus: Menu[] = menus.filter(
        (menu: Menu) =>
          menu.parentId === 0 && menu.treeLevel === 1
      );

      console.log("Top Level Menus:", topLevelMenus);

      // Example: যদি Leave সম্পর্কিত কিছু filter করতে চাও
      // const leaveData = menus.filter(
      //   (menu: Menu) =>
      //     menu.name?.toLowerCase().includes("leave")
      // );

     // setLeaves(leaveData);

    } catch (err: unknown) {
      console.warn("Failed to fetch menus", err);
    } finally {
      setLoading(false);
    }
  };

  fetchMenus();
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
      {loading ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading leave list...</Text>
        </View>
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}

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
    </View>
  );
};

export default LeaveScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  sub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
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
    backgroundColor: '#f97316', // orange
  },
  approved: {
    backgroundColor: '#16a34a', // green
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#1e293b',
    marginTop: 10,
  },
});