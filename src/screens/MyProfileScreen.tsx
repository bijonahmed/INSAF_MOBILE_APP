import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Card, Button, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profile_pic from '../../assets/img/profile_pic.png';

import { put, getUserInfo,putJSON } from '../config/apiHelper';
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

const MyProfileScreen = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      //username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      employeeId: employeeId,
      //isactive: true,
    };

    console.log("Profile Update Body:", body);
   // return false; 

    const res = await put(API_ENDPOINTS.HRM.UpdateSecUser, body);

    console.log("API Response:", res);

    if (res?.success) {
      await AsyncStorage.setItem('user_info', JSON.stringify(user));
      Alert.alert('Success', res?.message || 'Profile updated successfully!');
    } else {
      Alert.alert('Error', res?.message || 'Failed to update profile');
    }

  } catch (error: any) {
    console.log("Profile Update Error:", error);

    const apiMessage =
      error?.response?.data?.message ||
      'An error occurred while updating profile';

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
      Username: user?.username,
      passwordHash: password,
    };

    console.log('Calling URL:', url);
    console.log('Body:', body);

    const res = await put(url, body);

    console.log('Backend Response:', res);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'profile', label: 'Profile' },
          { value: 'password', label: 'Change Password' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Card style={styles.card}>
        {tab === 'profile' && (
          <View>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Image source={profile_pic} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user.username}</Text>
                <Text style={styles.position}>{user.rolename}</Text>
                <Text style={styles.email}>{user.email || 'N/A'}</Text>
              </View>
            </View>

            {/* Editable Info */}
            <View style={styles.infoSection}>
              <TextInput
                placeholder="Username"
               editable={false}
                value={user.username}
                onChangeText={(text) => setUser({ ...user, username: text })}
                style={styles.input}
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
              <TextInput
                placeholder="Role"
                value={user.rolename}
                style={[styles.input, { backgroundColor: '#e5e7eb' }]}
                editable={false}
              />
            </View>

            <Button mode="contained" onPress={handleProfileSubmit} style={styles.button}>
              Update Profile
            </Button>
          </View>
        )}

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
    backgroundColor: '#f1f5f9',
  },
  button: {
    elevation: 3,
    backgroundColor: '#de2628',
    borderRadius: 10,
    paddingVertical: 6,
  },
});