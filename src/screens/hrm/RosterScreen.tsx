import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { get, getUserInfo } from '../../config/apiHelper';
import { API_ENDPOINTS } from '../../config/apiRoutes';

type RosterItem = {
  id: number;
  employeeid: number;
  weekday: string;
  dutydate: string;
  isoffday: boolean;
  morningin: string;
  morningout: string;
  nightin: string;
  nightout: string;
};

const RosterScreen = () => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [rosterData, setRosterData] = useState<RosterItem[]>([]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const employeeId = userInfo?.employeeId;

      const url = `${API_ENDPOINTS.HRM.GetMonthlyRosterByEmpId}?empid=${employeeId}&monthNo=${month}&year=${year}`;
      const res = await get(url);

      setRosterData(res.data ?? []);
    } catch (err) {
      console.warn('Error fetching roster:', err);
    //  alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Convert "HH:mm:ss" to "hh:mm AM/PM"
  const convertTo12Hour = (time24: string) => {
    if (!time24 || time24 === '00:00:00') return '--';
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minStr} ${ampm}`;
  };

  const renderItem = ({ item }: { item: RosterItem }) => {
    const bgColor = item.isoffday ? '#e0f2fe' : '#fef3c7';
    return (
      <View style={[styles.rowCard, { backgroundColor: bgColor }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateText}>{item.dutydate}</Text>
          <Text style={styles.weekdayText}>{item.weekday}</Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={styles.timeText}>
            Mor.: {convertTo12Hour(item.morningin)} - {convertTo12Hour(item.morningout)}
          </Text>
          <Text style={styles.timeText}>
           Night: {convertTo12Hour(item.nightin)} - {convertTo12Hour(item.nightout)}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Chip style={[styles.statusChip, { backgroundColor: item.isoffday ? '#64748b' : '#16a34a' }]}>
            {item.isoffday ? 'Off Day' : 'Working'}
          </Chip>
        </View>
      </View>
    );
  };

  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  return (
    <View style={styles.container}>
      {/* Month & Year Picker */}
      <View style={styles.card}>
        {/* <Text style={styles.title}>Roster Report</Text> */}
        <Text style={styles.label}>Select Month</Text>
        <Picker
          selectedValue={month}
          onValueChange={setMonth}
          style={styles.picker}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <Picker.Item key={m} label={`Month ${m}`} value={m} />
          ))}
        </Picker>

        <Text style={styles.label}>Select Year</Text>
        <Picker
          selectedValue={year}
          onValueChange={setYear}
          style={styles.picker}
        >
          {years.map(y => (
            <Picker.Item key={y} label={`${y}`} value={y} />
          ))}
        </Picker>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleGenerate}
          loading={loading}
        >
          Generate
        </Button>
      </View>

      {/* Roster List */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={rosterData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50, paddingTop: 10 }}
        />
      )}
    </View>
  );
};

export default RosterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f2fe', paddingHorizontal: 16 },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  picker: { backgroundColor: '#f1f5f9', borderRadius: 10 },
  button: { marginTop: 16, backgroundColor: '#010611' },
  rowCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dateText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  weekdayText: { fontSize: 14, color: '#64748b' },
  timeText: { fontSize: 14, color: '#334155', marginTop: 4 },
  statusChip: { height: 28, justifyContent: 'center', paddingHorizontal: 8 },
});