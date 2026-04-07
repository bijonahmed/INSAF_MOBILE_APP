import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  const cards = [
    {
      title: 'Attendance',
      sub: 'Details Report',
      color: '#2563eb',
      onPress: () => navigation.navigate('Attendance'),
    },
    /*
    {
      title: 'Late',
      sub: 'Track late entry',
      color: '#f97316',
      onPress: () => navigation.navigate('Dashboard'),
    },
    {
      title: 'Salary',
      sub: 'Payment info',
      color: '#16a34a',
      onPress: () => navigation.navigate('Dashboard'),
    },
    {
      title: 'Payslip',
      sub: 'Download Payslip',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('Dashboard'),
    },
    */
  ];

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Reports Dashboard</Text> */}

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: card.color }]}
            onPress={card.onPress}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.sub && <Text style={styles.cardSub}>{card.sub}</Text>}
            </View>
          </TouchableOpacity>
        ))}
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
    fontSize: 24,
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
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardContent: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardSub: {
    fontSize: 12,
    color: '#f0f9ff',
    marginTop: 6,
  },
});