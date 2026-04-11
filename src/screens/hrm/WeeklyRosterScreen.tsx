import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { get, getUserInfo } from '../../config/apiHelper';
import { API_ENDPOINTS } from '../../config/apiRoutes';

type RosterItem = {
  id: number;
  dayno: number;
  weekday: string;
  morningin: string;
  morningout: string;
  nightin: string | null;
  nightout: string | null;
  isoffday: boolean;
};

const WeeklyRosterScreen = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rosterData, setRosterData] = useState<RosterItem[]>([]);


  useEffect(() => {
    defaultLoading();
  }, []);


  const defaultLoading = async () => {
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const employeeId = userInfo?.employeeId;

      const url = `${API_ENDPOINTS.HRM.GetWeeklyRosterByEmpId}?empid=${employeeId}`;
      const res = await get(url);

      setRosterData(res.data ?? []);
    } catch (err) {
      console.warn('Error fetching roster:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await defaultLoading();
    setRefreshing(false);
  };

  // 🕒 Time Convert
  const convertTo12Hour = (time24: string | null) => {
    if (!time24 || time24 === '00:00:00') return '--';
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minStr} ${ampm}`;
  };

  // 🎨 Day Color
  const getDayColor = (dayno: number) => {
    const colors = [
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#ef4444',
    ];
    return colors[dayno - 1] || '#64748b';
  };

  // 🎨 Render Card
  const renderItem = ({ item }: { item: RosterItem }) => {
    const color = getDayColor(item.dayno);

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.weekday}>{item.weekday}</Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.isoffday ? '#94a3b8' : '#22c55e',
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.isoffday ? 'OFF DAY' : 'WORKING'}
            </Text>
          </View>
        </View>

        {/* Time Section */}
        <View style={styles.timeSection}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Morning</Text>
            <Text style={styles.timeValue}>
              {convertTo12Hour(item.morningin)} -{' '}
              {convertTo12Hour(item.morningout)}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Night</Text>
            <Text style={styles.timeValue}>
              {convertTo12Hour(item.nightin)} -{' '}
              {convertTo12Hour(item.nightout)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Weekly Roster</Text> */}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : rosterData.length === 0 ? (
        <Text style={styles.empty}>No roster found</Text>
      ) : (
        <FlatList
          data={rosterData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default WeeklyRosterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    color: '#0f172a',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    borderLeftWidth: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  weekday: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeBlock: {
    flex: 1,
  },

  timeLabel: {
    fontSize: 12,
    color: '#64748b',
  },

  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#64748b',
    fontSize: 14,
  },
});