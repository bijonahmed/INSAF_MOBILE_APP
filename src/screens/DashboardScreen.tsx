import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  BackHandler,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'New Employee Added' },
    { id: '2', title: 'Roster Updated' },
    { id: '3', title: 'Report Ready' },
  ];

  /* ================= CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-GB');
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ================= EXIT ================= */
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          // 1️⃣ Clear stored data (tokens, user info, etc.)
          await AsyncStorage.clear();

          // 2️⃣ Exit app completely on Android
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          } else {
            // 3️⃣ Reset navigation for iOS (cannot fully exit)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }], // your login screen
            });
          }
        },
      },
    ]);
  };
  /* ================= ICONS ================= */
  const LogoutIcon = ({ size = 24, color = 'red' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 17L21 12L16 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12H9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const NotificationIcon = ({ size = 24, color = '#0f172a' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 5.23858 15.7614 3 13 3C10.2386 3 8 5.23858 8 8V10C8 11.1046 7.10457 12 6 12H18C16.8954 12 16 11.1046 16 10V8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12V14C6 16.2091 7.79086 18 10 18H14C16.2091 18 18 16.2091 18 14V12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="18" cy="6" r="3" fill="red" />
    </Svg>
  );

  const colors = darkMode
    ? { background: '#1f2937', text: '#f1f5f9', searchBg: '#4b5563' }
    : { background: '#f8fafc', text: '#0f172a', searchBg: '#fff' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: colors.text }]}>Bijon</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Notification */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={{ marginRight: 16 }}
          >
            <NotificationIcon color={darkMode ? '#f1f5f9' : '#0f172a'} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <LogoutIcon color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* NOTIFICATION MODAL */}
      <Modal visible={showNotifications} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        />
        <View style={styles.modalContent}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10 }}>
            Notifications
          </Text>
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Text style={{ paddingVertical: 8, fontSize: 14 }}>
                {item.title}
              </Text>
            )}
          />
        </View>
      </Modal>

      {/* SCROLL CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* CLOCK */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTime}>{formatTime(time)}</Text>
          <Text style={styles.clockDate}>{formatDate(time)}</Text>
          <Text style={styles.clockDate}>{getGreeting()}</Text>
        </View>

       

        {/* CARDS */}
        <View style={styles.grid}>
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('Employee')}
          >
            <Text style={styles.cardTitle}>Employees</Text>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: '#16a34a' }]}
            onPress={() => navigation.navigate('Roster')}
          >
            <Text style={styles.cardTitle}>Roster</Text>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: '#7c3aed' }]}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.cardTitle}>Reports</Text>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: '#7c3aed' }]}
            onPress={() => navigation.navigate('Leave')}
          >
            <Text style={styles.cardTitle}>Leave</Text>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: '#241b33' }]}
            onPress={() => navigation.navigate('LockScreen')}
          >
            <Text style={styles.cardTitle}>Screen Lock</Text>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: '#241b33' }]}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.cardTitle}>Test</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  title: { fontSize: 18, fontWeight: '700' },
  content: { paddingBottom: 20 },
  clockCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  clockTime: { fontSize: 34, fontWeight: '700', color: '#38bdf8' },
  clockDate: { fontSize: 13, color: '#e5e7eb', marginTop: 4 },
  searchInput: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    paddingVertical: 25,
    marginBottom: 16,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 220,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 6,
  },
});
