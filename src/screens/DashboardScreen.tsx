import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { getUserInfo } from '../config/apiHelper';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
// ================= SVG ICONS =================
const LogoutIcon = ({ size = 24, color = 'red' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16 17L21 12L16 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const NotificationIcon = ({ size = 24, color = '#0f172a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8C18 5.23858 15.7614 3 13 3C10.2386 3 8 5.23858 8 8V10C8 11.1046 7.10457 12 6 12H18C16.8954 12 16 11.1046 16 10V8Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 12V14C6 16.2091 7.79086 18 10 18H14C16.2091 18 18 16.2091 18 14V12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="18" cy="6" r="3" fill="red" />
  </Svg>
);
// ================= PULSE CARD =================
const SimpleCard = ({
  style,
  onPress,
  children,
}: {
  style: any;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  return (
    <View
      style={{
        width: '48%',
        marginBottom: 16,
      }}
    >
      <Card
        style={[styles.card, style, { width: '100%', marginBottom: 0 }]}
        onPress={onPress}
      >
        {children}
      </Card>
    </View>
  );
};
// ================= MAIN COMPONENT =================
const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [time, setTime] = useState(new Date());
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isIncharge, setIsIncharge] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [username, setUsername] = useState<string>('');
  const notifications = [
    { id: '1', title: 'New Employee Added' },
    { id: '2', title: 'Roster Updated' },
    { id: '3', title: 'Report Ready' },
  ];
  // ================= CLOCK =================
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
  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserInfo();
      if (user) {
        setUsername(user.username || user.firstName || '');
        setIsSupervisor(user.is_supervisor === true);
        setIsIncharge(user.is_incharge === true);
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    };
    loadUser();
  }, [navigation]);
  const hasElevatedRole = isSupervisor || isIncharge;
  // ================= LOGOUT =================
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('user_info');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (err) {
            console.warn('Logout failed:', err);
          }
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Welcome, {username || 'User'}!</Text>
        <View style={styles.topBarStyle}>
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={styles.iconButton}
          >
            <NotificationIcon color="#0f172a" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <LogoutIcon color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      {/* ── NOTIFICATION MODAL ── */}
      <Modal visible={showNotifications} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        />
        <View style={styles.modalContent}>
          <Text style={styles.notificationHeader}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Text style={styles.notificationMsg}>{item.title}</Text>
            )}
          />
        </View>
      </Modal>
      {/* ── SCROLL CONTENT ── */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* CLOCK */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTime}>{formatTime(time)}</Text>
          <Text style={styles.clockDate}>{formatDate(time)}</Text>
          <Text style={styles.clockGreeting}>{getGreeting()}</Text>
        </View>
        {/* ── STANDARD CARDS ── */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Card style={[styles.card, styles.cardGreen]} onPress={() => navigation.navigate('WeeklyRoster')}>
              <Text style={styles.cardTitle}>Weekly Roster</Text>
            </Card>
          </View>
          <View style={styles.gridItem}>
            <Card style={[styles.card, styles.cardGreen]} onPress={() => navigation.navigate('MonthlyRoster')}>
              <Text style={styles.cardTitle}>Monthly Roster</Text>
            </Card>
          </View>
          <View style={styles.gridItem}>
            <Card style={[styles.card, styles.cardOrange]} onPress={() => navigation.navigate('Leave')}>
              <Text style={styles.cardTitle}>My Leave</Text>
            </Card>
          </View>
          <View style={styles.gridItem}>
            <Card style={[styles.card, styles.cardPurple]} onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.cardTitle}>My Reports</Text>
            </Card>
          </View>
          <View style={styles.gridItem}>
            <Card style={[styles.card, styles.cardPink]} onPress={() => navigation.navigate('MyProfile')}>
              <Text style={styles.cardTitle}>My Profile</Text>
            </Card>
          </View>
          {/* Empty placeholder to balance last row */}
          <View style={styles.gridItem} />
        </View>
        {/* ── ELEVATED ROLE SECTION ── */}
        {hasElevatedRole && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.sectionLabel}>Management</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.grid_management}>
              <View style={styles.gridItem}>
                <Card
                  style={[styles.card, styles.cardIndigo]}
                  onPress={() => navigation.navigate('EmpWeeklyRosterScreen')}
                >
                  <Text style={styles.cardTitle}>Emp. Weekly Roster</Text>
                </Card>
              </View>
              <View style={styles.gridItem}>
                <Card
                  style={[styles.card, styles.cardTeal]}
                  onPress={() => navigation.navigate('EmpMonthlyRosterScreen')}
                >
                  <Text style={styles.cardTitle}>Emp. Monthly Roster</Text>
                </Card>
              </View>
              <View style={styles.gridItem}>
                <Card
                  style={[styles.card, styles.cardAmber]}
                  onPress={() => navigation.navigate('EmployeeAttendanceScreen')}
                >
                  <Text style={styles.cardTitle}>Emp. Attendance</Text>
                </Card>
              </View>
              {/* Empty placeholder to balance last row */}
              <View style={styles.gridItem} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
export default DashboardScreen;
// ================= STYLES =================
const styles = StyleSheet.create({
  grid_management: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  // ── Top bar ──────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  topBarStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {},
  // ── Notification modal ────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalContent: {
    position: 'absolute',
    top: 68,
    right: 16,
    width: 230,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  notificationHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notificationMsg: {
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  // ── Scroll content ────────────────────────
  content: {
    paddingBottom: 32,
  },
  // ── Clock ─────────────────────────────────
  clockCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  clockTime: {
    fontSize: 40,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  clockDate: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  clockGreeting: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  // ── Grid ──────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // ── Cards ─────────────────────────────────
  card: {
    width: '100%',      // ← fills gridItem (50% of screen)
    paddingVertical: 15,
    marginBottom: 0,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // ── Section divider ───────────────────────
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 10,
  },
  // ── Card colors ───────────────────────────
  cardBlue: { backgroundColor: '#2563eb' },
  cardGreen: { backgroundColor: '#16a34a' },
  cardPurple: { backgroundColor: '#7c3aed' },
  cardOrange: { backgroundColor: '#f97316' },
  cardPink: { backgroundColor: '#db2777' },
  cardIndigo: { backgroundColor: '#4f46e5' },
  cardTeal: { backgroundColor: '#0d9488' },
  cardAmber: { backgroundColor: '#d97706' },
});