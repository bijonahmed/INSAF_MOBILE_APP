import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-paper';
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
    } finally {
      setLoading(false);
    }
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24 || time24 === '00:00:00') return '--';
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minStr} ${ampm}`;
  };

  const renderItem = ({ item }: { item: RosterItem }) => {
    return (
      <View style={styles.rosterCard}>
        {/* LEFT DATE */}
        <View style={styles.dateBox}>
          <Text style={styles.date}>{item.dutydate}</Text>
          <Text style={styles.weekday}>{item.weekday}</Text>
        </View>

        {/* MIDDLE TIME */}
        <View style={styles.timeBox}>
          <View style={styles.timeRow}>
            <Text style={styles.label}>Morning</Text>
            <Text style={styles.time}>
              {convertTo12Hour(item.morningin)} - {convertTo12Hour(item.morningout)}
            </Text>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.label}>Night</Text>
            <Text style={styles.time}>
              {convertTo12Hour(item.nightin)} - {convertTo12Hour(item.nightout)}
            </Text>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.statusBox}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isoffday ? '#94a3b8' : '#22c55e',
              },
            ]}
          >
            <Text style={styles.statusText}>
              {item.isoffday ? 'Off Day' : 'Working'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  return (
    <View style={styles.container}>
      {/* FILTER CARD */}
      <View style={styles.filterCard}>
        <Text style={styles.header}>Roster Report</Text>

        <Text style={styles.labelTop}>Select Month</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={month} onValueChange={setMonth}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <Picker.Item key={m} label={`Month ${m}`} value={m} />
            ))}
          </Picker>
        </View>

        <Text style={styles.labelTop}>Select Year</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={year} onValueChange={setYear}>
            {years.map(y => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            ))}
          </Picker>
        </View>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleGenerate}
          loading={loading}
        >
          Generate Report
        </Button>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : rosterData.length === 0 ? (
        <Text style={styles.empty}>No roster found</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
  },

  filterCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    elevation: 4,
  },

  header: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#0f172a',
  },

  labelTop: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#64748b',
  },

  pickerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },

  button: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#0f172a',
  },

  rosterCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
  },

  dateBox: {
    flex: 1,
    justifyContent: 'center',
  },

  date: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },

  weekday: {
    fontSize: 12,
    color: '#64748b',
  },

  timeBox: {
    flex: 2,
    paddingHorizontal: 10,
  },

  timeRow: {
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    color: '#64748b',
  },

  time: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },

  statusBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748b',
  },
});