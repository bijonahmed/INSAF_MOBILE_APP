import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const DashboardScreen = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp>();
  const [time, setTime] = useState(new Date());

  /* ⏰ REAL-TIME CLOCK */
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          INSAF BARAKAH Kidney & General Hospital
        </Text>

        {/* ⏰ CLOCK */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTime}>{formatTime(time)}</Text>
          <Text style={styles.clockDate}>{formatDate(time)}</Text>
        </View>

        {/* 🔹 GRID */}
        <View style={styles.grid}>
          <Card
            style={[styles.card, styles.employeeCard]}
            onPress={() => navigation.navigate('Employee')}
          >
            <Text style={styles.cardTitle}>Employees</Text>
            <Text style={styles.cardSub}>Manage staff</Text>
          </Card>

          <Card
            style={[styles.card, styles.rosterCard]}
            onPress={() => navigation.navigate('Roster')}
          >
            <Text style={styles.cardTitle}>Roster</Text>
            <Text style={styles.cardSub}>Duty schedule</Text>
          </Card>

          <Card
            style={[styles.card, styles.leaveCard]}
            onPress={() => navigation.navigate('Leave')}
          >
            <Text style={styles.cardTitle}>Leave</Text>
            <Text style={styles.cardSub}>Leave requests</Text>
          </Card>

          <Card
            style={[styles.card, styles.reportCard]}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardSub}>Analytics & data</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center', // center content
    alignItems: 'center',
    paddingTop: 60, // pushes content down from the top
    paddingHorizontal: 16, // optional horizontal padding
  },
  content: {
    padding: 1,
    paddingBottom: 40,
  },

  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
    textAlign: 'center',
  },

  clockCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 22,
    elevation: 6,
  },
  clockTime: {
    fontSize: 34,
    fontWeight: '700',
    color: '#38bdf8',
  },
  clockDate: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    paddingVertical: 22,
    marginBottom: 16,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cardSub: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 2,
  },

  employeeCard: { backgroundColor: '#2563eb' },
  rosterCard: { backgroundColor: '#16a34a' },
  leaveCard: { backgroundColor: '#f97316' },
  reportCard: { backgroundColor: '#7c3aed' },
});
