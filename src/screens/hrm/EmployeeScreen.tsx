import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Text, Card, Button, Menu, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from '../../config/apiHelper';
import Svg, { Path } from 'react-native-svg';

interface Employee {
  employeeid: number;
  employeename: string;
  employeecode: string;
  mobilephone: string;
  departmentname: string;
  jobtitle: string;
  employmentstatus: string;
  supervisorname: string;
  joineddate: string;
  is_active: boolean;
}

interface Department {
  departmentid: number;
  departmentname: string;
}

const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [displayEmployees, setDisplayEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterTextName, setFilterTextName] = useState('');
  const [filterTextCode, setFilterTextCode] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<Department | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const ITEMS_PER_LOAD = 100;

  // Load employees and departments
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          Alert.alert('Error', 'Token not found. Please login again.');
          setLoading(false);
          return;
        }

        // Fetch Employees
        const empRes = await get('v1/Employment/GetEmployeeList', token);
        if (empRes?.data && Array.isArray(empRes.data)) {
          setEmployees(empRes.data);
          setDisplayEmployees(empRes.data.slice(0, ITEMS_PER_LOAD));
        } else {
          Alert.alert('Error', 'Failed to fetch employees.');
        }

        // Fetch Departments
        const deptRes = await get('v1/HrManagement/GetDepartmentList', token);
        if (deptRes?.data && Array.isArray(deptRes.data)) {
          setDepartments(deptRes.data);
        }
      } catch (err: any) {
        console.warn(err);
        Alert.alert('Error', 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayEmployees.length;
      const more = employees.slice(currentLength, currentLength + ITEMS_PER_LOAD);
      setDisplayEmployees([...displayEmployees, ...more]);
      setLoadingMore(false);
    }, 500);
  };

  const handleFilter = () => {
    const filtered = employees.filter((e) =>
      e.employeename.toLowerCase().includes(filterTextName.toLowerCase()) &&
      e.employeecode.toLowerCase().includes(filterTextCode.toLowerCase()) &&
      (!filterDepartment || e.departmentname === filterDepartment.departmentname)
    );
    setDisplayEmployees(filtered.slice(0, ITEMS_PER_LOAD));
    setFilterModalVisible(false);
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity onPress={() => setSelectedEmployee(item)}>
      <Card style={styles.employeeCard}>
        <View style={styles.employeeRow}>
          <Text style={styles.employeeName}>{item.employeename}</Text>
          <Text style={styles.employeeDept}>
            {item.departmentname || 'N/A'} {'\n'}
            {item.mobilephone}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#de2628" />
        <Text style={{ marginTop: 10 }}>Loading employees...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 4H21M6 12H18M10 20H14"
            stroke="#de2628"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Employees</Text>

            <TextInput
              placeholder="Employee Name"
              value={filterTextName}
              onChangeText={setFilterTextName}
              style={styles.filterInput}
            />
            <TextInput
              placeholder="Employee Code"
              value={filterTextCode}
              onChangeText={setFilterTextCode}
              style={styles.filterInput}
            />

            {/* Department Dropdown */}
            <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
              {departments.map((d) => (
                <TouchableOpacity
                  key={d.departmentid} // ✅ should work if unique
                  onPress={() => setFilterDepartment(d)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor:
                      filterDepartment?.departmentid === d.departmentid ? '#de2628' : '#f1f5f9',
                    marginBottom: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: filterDepartment?.departmentid === d.departmentid ? '#fff' : '#000' }}>
                    {d.departmentname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button mode="contained" onPress={handleFilter} style={styles.applyBtn}>
              Apply
            </Button>
            <Button
              mode="text"
              onPress={() => setFilterModalVisible(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Employee Detail Modal */}
      <Modal visible={!!selectedEmployee} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView>
              {selectedEmployee && (
                <>
                  <Text style={styles.modalTitle}>{selectedEmployee.employeename}</Text>
                  <Text style={styles.detailText}>Code: {selectedEmployee.employeecode}</Text>
                  <Text style={styles.detailText}>Department: {selectedEmployee.departmentname || 'N/A'}</Text>
                  <Text style={styles.detailText}>Job Title: {selectedEmployee.jobtitle || 'N/A'}</Text>
                  <Text style={styles.detailText}>Mobile: {selectedEmployee.mobilephone}</Text>
                  <Text style={styles.detailText}>Supervisor: {selectedEmployee.supervisorname || 'N/A'}</Text>
                  <Text style={styles.detailText}>Status: {selectedEmployee.is_active ? 'Active' : 'Inactive'}</Text>
                  <Text style={styles.detailText}>Joined: {selectedEmployee.joineddate}</Text>
                </>
              )}
              <Button
                mode="contained"
                style={{ marginTop: 20, borderRadius: 12 }}
                onPress={() => setSelectedEmployee(null)}
              >
                Close
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Employee List */}
      <FlatList
        data={displayEmployees}
        keyExtractor={(item) => item.employeeid.toString()}
        renderItem={renderEmployee}
        ListFooterComponent={
          !filterTextName && !filterTextCode && !filterDepartment && displayEmployees.length < employees.length ? (
            <Button
              mode="contained"
              onPress={handleLoadMore}
              loading={loadingMore}
              style={styles.loadMoreBtn}
              labelStyle={{ color: '#fff', fontWeight: '600' }}
            >
              Load More
            </Button>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  employeeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderColor: '#de2628',
    borderWidth: 1,
    elevation: 2,
  },
  employeeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  employeeName: { fontSize: 16, fontWeight: '600', flex: 2 },
  employeeDept: { fontSize: 14, color: '#6b7280', flex: 1, textAlign: 'center' },
  loadMoreBtn: { marginVertical: 12, borderRadius: 12, backgroundColor: '#de2628', elevation: 3 },
  filterButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  filterInput: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, height: 44 },
  applyBtn: { marginBottom: 8, borderRadius: 12 },
  cancelBtn: { borderRadius: 12 },
  detailModalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    elevation: 10,
  },
  detailText: { fontSize: 16, marginBottom: 8 },
});