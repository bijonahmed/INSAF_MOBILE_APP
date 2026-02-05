import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card, Portal, Dialog, Button } from 'react-native-paper';

/* ================= TYPES ================= */
type EmployeeApiType = {
  employeeid: number;
  employeename: string;
  employeecode: string;
  mobilephone: string;
  departmentname: string;
  jobtitle: string;
  employmentstatus: string;
  joineddate: string;
  grade: string;
  supervisorname: string;
  is_active: boolean;
};

/* ================= COMPONENT ================= */
const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<EmployeeApiType[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeApiType | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= API CALL ================= */
  useEffect(() => {
    setLoading(true);
    fetch('http://45.251.56.104:82/api/Employment/GetEmployeeList')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setEmployees(json.data);
        }
      })
      .catch(err => console.log('API ERROR:', err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= DIALOG ================= */
  const showDialog = (employee: EmployeeApiType) => {
    setSelectedEmployee(employee);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setSelectedEmployee(null);
  };

  /* ================= LIST ITEM ================= */
  const renderEmployee = ({ item }: { item: EmployeeApiType }) => (
    <Card style={styles.card} onPress={() => showDialog(item)}>
      <Text style={styles.name}>
        {item.employeename} ({item.employeecode})
      </Text>
    </Card>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        keyExtractor={item => item.employeeid.toString()}
        renderItem={renderEmployee}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* 🔹 DETAILS POPUP */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Employee Details</Dialog.Title>
          <Dialog.Content>
            {selectedEmployee && (
              <>
                <Text style={styles.detail}>
                  Name: {selectedEmployee.employeename}
                </Text>
                <Text style={styles.detail}>
                  Code: {selectedEmployee.employeecode}
                </Text>
                <Text style={styles.detail}>
                  Job Title: {selectedEmployee.jobtitle}
                </Text>
                <Text style={styles.detail}>
                  Department: {selectedEmployee.departmentname}
                </Text>
                <Text style={styles.detail}>
                  Phone: {selectedEmployee.mobilephone}
                </Text>
                <Text style={styles.detail}>
                  Status: {selectedEmployee.employmentstatus}
                </Text>
                <Text style={styles.detail}>
                  Grade: {selectedEmployee.grade}
                </Text>
                <Text style={styles.detail}>
                  Joined Date: {selectedEmployee.joineddate.split('T')[0]}
                </Text>
                {selectedEmployee.supervisorname ? (
                  <Text style={styles.detail}>
                    Supervisor: {selectedEmployee.supervisorname}
                  </Text>
                ) : null}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 🔹 DARK LOADER OVERLAY */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      )}
    </View>
  );
};

export default EmployeeScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 14,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    marginBottom: 6,
    color: '#334155',
  },
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
    color: '#ffffff',
    marginTop: 10,
    fontSize: 14,
  },
});
