import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, Button, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profile_pic from '../../assets/img/profile_pic.png';
import { put, get, getUserInfo, post } from '../config/apiHelper';
import { API_ENDPOINTS } from '../config/apiRoutes';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  rolename: string;
  employeeid?: number;
  lastLoginAt: string;
  password?: string;
  passwordHash?: string;
}

interface EmpDetail {
  empGeneralDto?: any;
  empPersonalDto?: any;
  empJobDto?: any;
  empCertificateDtos?: any[];
  empEducationDtos?: any[];
  empWorkExperienceDtos?: any[];
  empDependentDtos?: any[];
  [key: string]: any;
}

const MyProfileScreen = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tab, setTab] = useState<'profile' | 'details' | 'password'>('profile');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [empData, setEmpData] = useState<EmpDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user_info');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
        }
      } catch (err) {
        console.warn('Failed to load user info:', err);
      }
    };
    loadUser();
  }, []);

  // Fetch employee details
  useEffect(() => {
    getEmployeeViewDetails();
  }, []);

  const getEmployeeViewDetails = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const employeeId = userInfo?.employeeId;
      const url = `${API_ENDPOINTS.EMPLOYMENT.GetEmployeeDetails}/${employeeId}`;
      const res = await get(url);
      console.log('Employee Details Response:', res);
      setEmpData(res.data ?? null);
    } catch (err) {
      console.warn('Error fetching employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleProfileSubmit = async () => {
    if (!user?.username.trim() || !user.firstName.trim() || !user.lastName.trim()) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }
    const userInfo = await getUserInfo();
    const employeeId = userInfo?.employeeId;
    try {
      const body = {
        id: user.id,
        username: user.username,
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        firstname: user.firstName,
        lastname: user.lastName,
        employeeId: employeeId,
      };
      const res = await post(API_ENDPOINTS.HRM.UpdateSecUser, body, {} as any);
      if (res?.success) {
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
        Alert.alert('Success', res?.message || 'Profile updated successfully!');
      } else {
        Alert.alert('Error', res?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message || 'An error occurred while updating profile';
      Alert.alert('Error', apiMessage);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill both password fields');
      return;
    }
    if (password.length < 2) {
      Alert.alert('Validation Error', 'Password must be at least 2 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }
    try {
      const url = `${API_ENDPOINTS.HRM.ResetPassSecUser}/${user?.id}`;
      const body = {
        id: user?.id,
        password: password,
        password_confirmation: confirmPassword,
      };
      const res = await put(url, body);
      if (res?.success) {
        const updatedUser = { ...user, password };
        await AsyncStorage.setItem('user_info', JSON.stringify(updatedUser));
        Alert.alert('Success', res.message || 'Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', res?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password Update Error:', err);
      Alert.alert('Error', 'Failed to update password');
    }
  };

  // Helper to render a detail row
  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value ?? 'N/A'}</Text>
    </View>
  );

  // Helper to format keys nicely
  const formatLabel = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setTab('profile')}
          style={[styles.tabButton, tab === 'profile' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabIcon, tab === 'profile' && styles.tabIconActive]}>{'👤'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('details')}
          style={[styles.tabButton, tab === 'details' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabIcon, tab === 'details' && styles.tabIconActive]}>{'ℹ️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('password')}
          style={[styles.tabButton, tab === 'password' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabIcon, tab === 'password' && styles.tabIconActive]}>{'🔒'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <View>
            <View style={styles.profileHeader}>
              <Image source={profile_pic} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user.username}</Text>
                <Text style={styles.position}>{user.rolename}</Text>
                <Text style={styles.email}>{user.email || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoSection}>
              <TextInput
                placeholder="Username"
                editable={false}
                value={user.username}
                style={[styles.input, styles.inputDisabled]}
              />
              <TextInput
                placeholder="First Name"
                value={user.firstName}
                onChangeText={(text) => setUser({ ...user, firstName: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Last Name"
                value={user.lastName}
                onChangeText={(text) => setUser({ ...user, lastName: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Email"
                value={user.email || ''}
                onChangeText={(text) => setUser({ ...user, email: text })}
                style={styles.input}
              />
            </View>
            <Button mode="contained" onPress={handleProfileSubmit} style={styles.button}>
              Update Profile
            </Button>
          </View>
        )}

        {/* ── DETAILS TAB ── */}
        {tab === 'details' && (
          <View>
            {loading ? (
              <ActivityIndicator size="large" color="#de2628" style={{ marginVertical: 32 }} />
            ) : empData ? (
              <View style={styles.infoSection}>
                {/* General Info */}
                <Text style={styles.sectionTitle}>General Info</Text>
                {/* Show photo */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Photo</Text>
                  {empData.empGeneralDto?.photo ? (
                    <Image
                      source={{ uri: empData.empGeneralDto.photo }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.detailValue}>No Photo</Text>
                  )}
                </View>
                {/* <DetailRow label="Employee Code" value={empData.empGeneralDto?.employeeid} /> */}
                <DetailRow label="Employee ID" value={empData.empGeneralDto?.employeecode} />
                <DetailRow label="Employee Name" value={empData.empGeneralDto?.employeename} />
                {/* <DetailRow label="Full Name" value={empData.empGeneralDto?.fullname} /> */}
                <DetailRow label="Mobile Phone" value={empData.empGeneralDto?.mobilephone} />
                <DetailRow label="Work Phone" value={empData.empGeneralDto?.workphone} />
                {/* <DetailRow label="Is Active" value={empData.empGeneralDto?.isactive ? 'Yes' : 'No'} /> */}
                {/* <DetailRow label="Photo" value={empData.empGeneralDto?.photo} /> */}

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>Personal Info</Text>
                <DetailRow label="Father Name" value={empData.empPersonalDto?.father_name} />
                <DetailRow label="Mother Name" value={empData.empPersonalDto?.mother_name} />
                <DetailRow label="Gender" value={empData.empPersonalDto?.gender} />
                <DetailRow label="Religion" value={empData.empPersonalDto?.religion} />
                <DetailRow label="Date of Birth" value={empData.empPersonalDto?.dob} />
                <DetailRow label="Blood Group" value={empData.empPersonalDto?.bloodgroup} />
                <DetailRow label="Marital Status" value={empData.empPersonalDto?.maritalstatus} />
                <DetailRow label="Nationality" value={empData.empPersonalDto?.nationality} />
                <DetailRow label="NID No" value={empData.empPersonalDto?.nidno} />
                <DetailRow label="Home Phone" value={empData.empPersonalDto?.homephone} />
                <DetailRow label="Present Address" value={empData.empPersonalDto?.presentaddress} />
                <DetailRow label="Permanent Address" value={empData.empPersonalDto?.permanentaddress} />

                {/* Job Info */}
                <Text style={styles.sectionTitle}>Job Info</Text>
                <DetailRow label="Joined Date" value={empData.empJobDto?.joineddate} />
                {/* <DetailRow label="Department ID" value={empData.empJobDto?.departmentid} /> */}
                <DetailRow label="Department" value={empData.empJobDto?.departmentname} />
                {/* <DetailRow label="Job Title ID" value={empData.empJobDto?.jobtitleid} /> */}
                <DetailRow label="Designation" value={empData.empJobDto?.jobtitlename} />
                <DetailRow label="Grade ID" value={empData.empJobDto?.gradeid} />
                {/* <DetailRow label="Employment Status ID" value={empData.empJobDto?.employmentstatusid} /> */}
                <DetailRow label="Daily Work Hours" value={empData.empJobDto?.dailyworkhours} />
                <DetailRow label="Probation End Date" value={empData.empJobDto?.probationenddate} />
                <DetailRow label="Date of Permanency" value={empData.empJobDto?.dateofpermanency} />
                <DetailRow label="Parent ID" value={empData.empJobDto?.parentid} />
                <DetailRow label="Is Supervisor" value={empData.empJobDto?.is_supervisor ? 'Yes' : 'No'} />
                <DetailRow label="Is Incharge" value={empData.empJobDto?.is_incharge ? 'Yes' : 'No'} />
                {/* <DetailRow label="Updated At" value={empData.empJobDto?.updated_at} /> */}

                {/* Certificates */}
                <Text style={styles.sectionTitle}>Certificates</Text>
                {empData.empCertificateDtos && empData.empCertificateDtos.length > 0 ? (
                  empData.empCertificateDtos.map((c, i) => (
                    <DetailRow key={i} label={c.certificate_name} value={c.remarks} />
                  ))
                ) : (
                  <DetailRow label="Certificates" value="No Data" />
                )}

                {/* Education */}

                <Text style={styles.sectionTitle}>Education</Text>
                {empData.empEducationDtos && empData.empEducationDtos.length > 0 ? (
                  empData.empEducationDtos.map((e, i) => (
                    <View key={i}>
                      <DetailRow label="Degree Level" value={e.degreelevel} />
                      <DetailRow label="Major Subject" value={e.majorsubject} />
                      <DetailRow label="Institute" value={e.institutename} />
                      <DetailRow label="Result" value={e.resultvalue} />
                      <DetailRow label="Passing Year" value={e.passingyear} />
                      {i < empData.empEducationDtos!.length - 1 && (
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#de262915', marginVertical: 10 }} />
                      )}
                    </View>
                  ))
                ) : (
                  <DetailRow label="Education" value="No Data" />
                )}

                {/* Work Experience */}
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {empData.empWorkExperienceDtos && empData.empWorkExperienceDtos.length > 0 ? (
                  empData.empWorkExperienceDtos.map((w, i) => (
                    <DetailRow key={i} label={w.job_title} value={w.company} />
                  ))
                ) : (
                  <DetailRow label="Work Experience" value="No Data" />
                )}

                {/* Dependents */}
                <Text style={styles.sectionTitle}>Dependents</Text>
                {empData.empDependentDtos && empData.empDependentDtos.length > 0 ? (
                  empData.empDependentDtos.map((d, i) => (
                    <View key={i}>
                      <DetailRow label="Member Name" value={d.membername} />
                      <DetailRow label="Relation" value={d.relation} />
                      <DetailRow label="Date of Birth" value={d.memberdob} />
                      <DetailRow label="Marital Status" value={d.maritalstatus} />
                      {empData.empDependentDtos && i < empData.empDependentDtos.length - 1 && (
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#de262915', marginVertical: 10 }} />
                      )}
                    </View>
                  ))
                ) : (
                  <DetailRow label="Dependents" value="No Data" />
                )}
              </View>
            ) : (
              <Text style={styles.noData}>No employee details found.</Text>
            )}
          </View>
        )}

        {/* ── PASSWORD TAB ── */}
        {tab === 'password' && (
          <View style={styles.infoSection}>
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
            />
            <Button mode="contained" onPress={handlePasswordSubmit} style={styles.button}>
              Update Password
            </Button>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginRight: 16 },
  profileInfo: {},
  name: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  position: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  email: { fontSize: 12, color: '#9ca3af' },
  infoSection: { marginBottom: 24 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 14,
    backgroundColor: '#f1f1f1de',
    borderWidth: 1,
    borderColor: '#404041',
  },
  inputDisabled: {
    color: '#9ca3af',
    backgroundColor: '#e5e7eb',
  },
  button: {
    elevation: 3,
    backgroundColor: '#de2628',
    borderRadius: 10,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noData: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 32,
    fontSize: 14,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },

  tabButtonActive: {
    backgroundColor: '#de262921',
  },

  tabIcon: {
    fontSize: 20,
    color: '#6b7280',
  },

  tabIconActive: {
    color: '#fff',
  }
});