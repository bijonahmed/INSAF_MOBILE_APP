import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Reports'
>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reports</Text>

      <View style={styles.grid}>
        {/* Attendance */}
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('Attendance')}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Attendance</Text>
            <Text style={styles.cardSub}>Details Report</Text>
          </View>
        </Card>

        {/* Late */}
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('Roster')} // change if needed
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Late</Text>
          </View>
        </Card>

        {/* Salary */}
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('Dashboard')} // change if needed
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Salary</Text>
          </View>
        </Card>

        {/* Payslip */}
        <Card
          style={styles.card}
          onPress={() => navigation.navigate('MyProfile')} // change if needed
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Payslip</Text>
          </View>
        </Card>
      </View>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e293b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
});