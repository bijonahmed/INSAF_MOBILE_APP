import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profile_pic from '../../assets/img/profile_pic.png'; // local profile picture

interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  rolename: string;
  lastLoginAt: string;
}

const MyProfileScreen = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  // Load user info from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user_info');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          console.log('User Info:', parsedUser); // log user info on load
        }
      } catch (err) {
        console.warn('Failed to load user info:', err);
      }
    };
    loadUser();
  }, []);

  if (!user) return null;

  // Handle form submission with validation
  const handleSubmit = async () => {
    if (!user.username.trim()) {
      Alert.alert('Validation Error', 'Username is required');
      return;
    }
    if (!user.firstName.trim()) {
      Alert.alert('Validation Error', 'First Name is required');
      return;
    }
    if (!user.lastName.trim()) {
      Alert.alert('Validation Error', 'Last Name is required');
      return;
    }

    // Save updated user to AsyncStorage
    try {
      await AsyncStorage.setItem('user_info', JSON.stringify(user));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.warn('Failed to save user info:', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Submit
        </Button>
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