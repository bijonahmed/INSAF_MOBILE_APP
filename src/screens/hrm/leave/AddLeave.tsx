import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { get, post, put } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  rolename: string;
  lastLoginAt: string;
}
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

const AddLeaveScreen = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [replacementEmployee, setReplacementEmployee] = useState<any>(null);
  const [leaveClass, setLeaveClass] = useState('');
  const [reason, setReason] = useState('');
  const [leaveAddress, setLeaveAddress] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigation = useNavigation<LeaveScreenNavigationProp>();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await get(API_ENDPOINTS.EMPLOYMENT.GET_EMPLOYEE_LIST);
        if (res?.data && Array.isArray(res.data)) {
          setEmployees(res.data);
        }

        const deptRes = await get(API_ENDPOINTS.HRM.GET_HR_LEAVE_TYPES);
        setLeaveTypes(deptRes.data);

        const userStr = await AsyncStorage.getItem('user_info');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          // console.log('User Info:', parsedUser); // log user info on load
        }
        setLoading(false);
      } catch (error) {
        console.log('Error fetching employees:', error);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !leaveClass || !reason) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    const body = {
      Id: 0,
      EmployeeId: user?.id,
      FromDate: fromDate.toISOString().split('T')[0],
      ToDate: toDate.toISOString().split('T')[0],
      LeaveTypeID: leaveClass,
      Reason: reason,
      leaveAddress: leaveAddress,
      replacementId: replacementEmployee?.employeeid || null,
    };

    console.log('Checked body:', body);

    try {
      const res = await put(API_ENDPOINTS.HRM.SAVE_LEAVE_APPLICATION, body);

      console.log('Full Response:', res);

      if (res?.success) {
        Alert.alert('Success', res?.message || 'Leave submitted successfully!');

        setFromDate(null);
        setToDate(null);
        setLeaveClass('');
        setReason('');
        setLeaveAddress('');
        setReplacementEmployee(null);

        navigation.navigate('LeaveHistory');
      } else {
        Alert.alert('Error', res?.message || 'Failed to submit leave.');
      }
    } catch (error: any) {
      console.log('Leave request error:', error);

      const apiMessage =
        error?.response?.data?.message ||
        'An error occurred while submitting leave.';

      Alert.alert('Error', apiMessage);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={styles.card}>
        {/* Employee Selection 
        <Text style={styles.label}>Employee *</Text>
        <Picker
          selectedValue={selectedEmployee?.id || ''}
          onValueChange={val => {
            const emp = employees.find(e => e.employeeid === val);
            setSelectedEmployee(emp || null);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Employee" value="" />
          {employees.map(emp => (
            <Picker.Item
              key={emp.employeeid}
              label={emp.employeename}
              value={emp.employeeid}
            />
          ))}
        </Picker>*/}

        {/* From Date */}
        <Text style={styles.label}>From Date *</Text>
        <TouchableOpacity onPress={() => setShowFromPicker(true)}>
          <RNTextInput
            placeholder="Select from date"
            value={fromDate ? fromDate.toDateString() : ''}
            editable={false}
            style={styles.input}
          />
        </TouchableOpacity>
        {showFromPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowFromPicker(false);
              if (date) setFromDate(date);
            }}
          />
        )}

        {/* To Date */}
        <Text style={styles.label}>To Date *</Text>
        <TouchableOpacity onPress={() => setShowToPicker(true)}>
          <RNTextInput
            placeholder="Select to date"
            value={toDate ? toDate.toDateString() : ''}
            editable={false}
            style={styles.input}
          />
        </TouchableOpacity>
        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowToPicker(false);
              if (date) setToDate(date);
            }}
          />
        )}

        {/* Leave Class */}
        <Text style={styles.label}>Leave Class *</Text>
        <Picker
          selectedValue={leaveClass}
          onValueChange={val => setLeaveClass(val)}
          style={styles.picker}
        >
          <Picker.Item label="Select Leave Class" value="" />
          {leaveTypes.map(item => (
            <Picker.Item key={item.id} label={item.name} value={item.id} />
          ))}
        </Picker>

        {/* Replacement Employee */}
        <Text style={styles.label}>Replacement Employee</Text>
        <Picker
          selectedValue={replacementEmployee?.id || ''}
          onValueChange={val => {
            const emp = employees.find(e => e.employeeid === val);
            setReplacementEmployee(emp || null);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Replacement" value="" />
          {employees.map(emp => (
            <Picker.Item
              key={emp.employeeid}
              label={emp.employeename}
              value={emp.employeeid}
            />
          ))}
        </Picker>

        {/* Reason */}
        <Text style={styles.label}>Leave Reason *</Text>
        <RNTextInput
          placeholder="Enter reason"
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 60 }]}
          value={reason}
          onChangeText={setReason}
        />

        {/* Address */}
        <Text style={styles.label}>Leave Address</Text>
        <RNTextInput
          placeholder="Enter address/phone"
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 60 }]}
          value={leaveAddress}
          onChangeText={setLeaveAddress}
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSelectedEmployee(null);
              setReplacementEmployee(null);
              setLeaveClass('');
              setReason('');
              setLeaveAddress('');
              setFromDate(null);
              setToDate(null);
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddLeaveScreen;

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#f8fafc',
  paddingHorizontal: 16,
  paddingTop: 20,
},
 
  label: { fontWeight: '600', marginBottom: 6, color: '#374151', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 15,
    backgroundColor: '#f9fafb',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    marginBottom: 15,
    backgroundColor: '#f9fafb',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#be185d',
    paddingVertical: 16,
    borderRadius: 14,
    marginRight: 6,
    alignItems: 'center',
    shadowColor: '#be185d',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resetButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 14,
    marginLeft: 6,
    alignItems: 'center',
  },
  resetText: { color: '#374151', fontWeight: 'bold', fontSize: 16 },
});

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
