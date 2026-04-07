import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { post, getUserInfo } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';

type AttendanceItem = {
  workdate: string;
  weekday: string;
  workstatus: string;
  workedminutes: number;
  overtime: number;
  latein: number | null;
  earlyout: number | null;
  isoffday: boolean;
  holidayname: string | null;
  leavetype: string | null;
  scheduledminutes: number;
  scheduledmorningin: string | null;
  actualmorningin: string | null;
  actualnightin: string | null;
  actualnightout: string | null;
  scheduledmorningout: string | null;
  actualmorningout: string | null;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; text: string; icon: string }> = {
  present:   { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', text: '#15803d', icon: '✓' },
  late:      { color: '#ea580c', bg: '#ffedd5', border: '#fed7aa', text: '#c2410c', icon: '⏰' },
  absent:    { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', text: '#b91c1c', icon: '✕' },
  leave:     { color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe', text: '#6d28d9', icon: '📋' },
  'off day': { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', text: '#475569', icon: '—' },
};

const getStatus = (item: AttendanceItem) => {
  const key = item.workstatus.toLowerCase();
  return STATUS_CONFIG[key] ?? STATUS_CONFIG['present'];
};

const formatMins = (mins: number) => {
  if (!mins) return '0h 0m';
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `${h}h ${m}m`;
};

const FILTERS = ['All', 'Present', 'Late', 'Absent', 'Leave', 'Off Day'];

const AttendanceScreen = () => {
  const [dateFrom, setDateFrom]               = useState<Date | null>(null);
  const [dateTo, setDateTo]                   = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker]   = useState(false);
  const [showToPicker, setShowToPicker]       = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [attendanceData, setAttendanceData]   = useState<AttendanceItem[]>([]);
  const [filterStatus, setFilterStatus]       = useState<string>('All');
  const [showFilterChips, setShowFilterChips] = useState(false);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split('T')[0] : '';

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) {
      Alert.alert('Warning', 'Please select From and To dates');
      return;
    }
    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const empid = userInfo?.employeeId;
      const body = {
        fromDate: formatDate(dateFrom),
        toDate: formatDate(dateTo),
        empId: empid,
      };
      const empRes = await post(API_ENDPOINTS.HRM.getMyAttendance, body, {} as any);
      const responseData = empRes.data;
      setAttendanceData(responseData.reportData ?? []);
      setShowFilterChips(true);
      setFilterStatus('All');
    } catch (err) {
      console.warn('Failed to generate report:', err);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const summary = attendanceData.reduce(
    (acc, item) => {
      const k = item.workstatus.toLowerCase();
      if (k === 'present')       acc.present++;
      else if (k === 'late')     acc.late++;
      else if (k === 'absent')   acc.absent++;
      else if (k === 'leave')    acc.leave++;
      else if (k === 'off day')  acc.offday++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, leave: 0, offday: 0 },
  );

  const filteredData =
    filterStatus === 'All'
      ? attendanceData
      : attendanceData.filter(
          item => item.workstatus.toLowerCase() === filterStatus.toLowerCase(),
        );

  const renderItem = ({ item }: { item: AttendanceItem }) => {
    const status  = getStatus(item);
    const hasShift = item.actualmorningin || item.actualmorningout;
    const hasNight = item.actualnightin && item.actualnightout;

    return (
      <View style={[styles.card, { borderLeftColor: status.color }]}>

        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.iconCircle, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.iconText, { color: status.color }]}>{status.icon}</Text>
          </View>

          <View style={styles.cardMeta}>
            <Text style={styles.cardDate}>{item.workdate}</Text>
            <Text style={styles.cardDay}>{item.weekday}</Text>
          </View>

          <View style={styles.cardRight}>
            <View style={[styles.statusPill, { backgroundColor: status.bg, borderColor: status.border }]}>
              <Text style={[styles.statusPillText, { color: status.text }]}>
                {item.workstatus}
              </Text>
            </View>
            {!item.isoffday && item.workedminutes > 0 && (
              <Text style={styles.workedText}>{formatMins(item.workedminutes)}</Text>
            )}
          </View>
        </View>

        {/* Holiday / Leave badges */}
        {(item.holidayname || item.leavetype) && (
          <View style={styles.badgeRow}>
            {item.holidayname && (
              <View style={styles.holidayBadge}>
                <Text style={styles.holidayBadgeText}>🎉 {item.holidayname}</Text>
              </View>
            )}
            {item.leavetype && (
              <View style={styles.leaveBadge}>
                <Text style={styles.leaveBadgeText}>📋 {item.leavetype}</Text>
              </View>
            )}
          </View>
        )}

        {/* Shift times */}
        {hasShift && (
          <View style={styles.shiftRow}>
            <View style={styles.shiftBlock}>
              <Text style={styles.shiftLabel}>IN</Text>
              <Text style={styles.shiftTime}>{item.actualmorningin ?? '—'}</Text>
            </View>
            <View style={styles.shiftArrow}>
              <Text style={styles.shiftArrowText}>→</Text>
            </View>
            <View style={styles.shiftBlock}>
              <Text style={styles.shiftLabel}>OUT</Text>
              <Text style={styles.shiftTime}>{item.actualmorningout ?? '—'}</Text>
            </View>
            {hasNight && (
              <>
                <View style={styles.shiftDivider} />
                <View style={styles.shiftBlock}>
                  <Text style={styles.shiftLabel}>NIGHT IN</Text>
                  <Text style={styles.shiftTime}>{item.actualnightin}</Text>
                </View>
                <View style={styles.shiftArrow}>
                  <Text style={styles.shiftArrowText}>→</Text>
                </View>
                <View style={styles.shiftBlock}>
                  <Text style={styles.shiftLabel}>NIGHT OUT</Text>
                  <Text style={styles.shiftTime}>{item.actualnightout}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Tags: late / early out / OT */}
        {(item.latein || item.earlyout || item.overtime > 0) ? (
          <View style={styles.tagRow}>
            {item.latein ? (
              <View style={styles.lateTag}>
                <Text style={styles.lateTagText}>⏰ Late {item.latein}m</Text>
              </View>
            ) : null}
            {item.earlyout ? (
              <View style={styles.earlyTag}>
                <Text style={styles.earlyTagText}>⚡ Early {item.earlyout}m</Text>
              </View>
            ) : null}
            {item.overtime > 0 && (
              <View style={styles.otTag}>
                <Text style={styles.otTagText}>+OT {formatMins(item.overtime)}</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => `${item.workdate}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* ── Page Header ── */}
            <View style={styles.pageHeader}>
              <Text style={styles.pageSub}>Track your daily records</Text>
            </View>

            {/* ── Filter Card ── */}
            <View style={styles.filterCard}>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>FROM</Text>
                  <TextInput
                    mode="outlined"
                    value={formatDate(dateFrom)}
                    placeholder="YYYY-MM-DD"
                    onFocus={() => setShowFromPicker(true)}
                    style={styles.dateInput}
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    textColor="#0f172a"
                    placeholderTextColor="#cbd5e1"
                  />
                  {showFromPicker && (
                    <DateTimePicker
                      value={dateFrom || new Date()}
                      mode="date"
                      display="default"
                      onChange={(e, selectedDate) => {
                        setShowFromPicker(Platform.OS === 'ios');
                        if (selectedDate) setDateFrom(selectedDate);
                      }}
                    />
                  )}
                </View>

                <View style={styles.dateSepBlock}>
                  <Text style={styles.dateSepText}>→</Text>
                </View>

                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>TO</Text>
                  <TextInput
                    mode="outlined"
                    value={formatDate(dateTo)}
                    placeholder="YYYY-MM-DD"
                    onFocus={() => setShowToPicker(true)}
                    style={styles.dateInput}
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    textColor="#0f172a"
                    placeholderTextColor="#cbd5e1"
                  />
                  {showToPicker && (
                    <DateTimePicker
                      value={dateTo || new Date()}
                      mode="date"
                      display="default"
                      onChange={(e, selectedDate) => {
                        setShowToPicker(Platform.OS === 'ios');
                        if (selectedDate) setDateTo(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.generateBtn, loading && { opacity: 0.6 }]}
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" size="small" />
                  : <Text style={styles.generateBtnText}>⚡ Generate Report</Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Summary Strip ── */}
            {showFilterChips && (
              <View style={styles.summaryStrip}>
                {[
                  { label: 'Present', count: summary.present, color: '#16a34a', bg: '#dcfce7' },
                  { label: 'Late',    count: summary.late,    color: '#ea580c', bg: '#ffedd5' },
                  { label: 'Absent',  count: summary.absent,  color: '#dc2626', bg: '#fee2e2' },
                  { label: 'Leave',   count: summary.leave,   color: '#7c3aed', bg: '#ede9fe' },
                  { label: 'Off',     count: summary.offday,  color: '#64748b', bg: '#f1f5f9' },
                ].map(s => (
                  <View key={s.label} style={[styles.summaryItem, { backgroundColor: s.bg }]}>
                    <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
                    <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Filter Chips ── */}
            {showFilterChips && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chipContent}
              >
                {FILTERS.map(status => {
                  const active = filterStatus === status;
                  const cfg = STATUS_CONFIG[status.toLowerCase()];
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        active && {
                          backgroundColor: cfg?.color ?? '#0ea5e9',
                          borderColor: cfg?.color ?? '#0ea5e9',
                        },
                      ]}
                      onPress={() => setFilterStatus(status)}
                      activeOpacity={0.75}
                    >
                      <Text style={[
                        styles.filterChipText,
                        active && { color: '#ffffff', fontWeight: '700' },
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {showFilterChips && (
              <Text style={styles.resultCount}>
                {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              </Text>
            )}
          </>
        }
      />
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  listContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },

  // ── Page Header ──
  pageHeader: {
    paddingTop: 28,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.8,
  },
  pageSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 3,
    fontWeight: '500',
  },

  // ── Filter Card ──
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginVertical: 14,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 6,
  },
  dateField: { flex: 1 },
  dateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0ea5e9',
    letterSpacing: 2,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    fontSize: 13,
    height: 46,
  },
  dateSepBlock: {
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  dateSepText: {
    color: '#cbd5e1',
    fontSize: 22,
    fontWeight: '300',
  },
  generateBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  generateBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Summary Strip ──
  summaryStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Filter Chips ──
  chipScroll: { marginBottom: 6 },
  chipContent: { gap: 8, paddingVertical: 4, paddingRight: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  resultCount: {
    color: '#cbd5e1',
    fontSize: 11,
    marginBottom: 10,
    marginLeft: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── Attendance Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: { flex: 1 },
  cardDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  cardDay: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  workedText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  holidayBadge: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  holidayBadgeText: { color: '#0369a1', fontSize: 11, fontWeight: '600' },
  leaveBadge: {
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  leaveBadgeText: { color: '#6d28d9', fontSize: 11, fontWeight: '600' },

  // Shift row
  shiftRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  shiftBlock: { alignItems: 'center' },
  shiftLabel: {
    fontSize: 9,
    color: '#cbd5e1',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  shiftTime: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  shiftArrow: { paddingHorizontal: 2 },
  shiftArrowText: { color: '#cbd5e1', fontSize: 16 },
  shiftDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  lateTag: {
    backgroundColor: '#ffedd5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  lateTagText: { color: '#c2410c', fontSize: 11, fontWeight: '600' },
  earlyTag: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  earlyTagText: { color: '#a16207', fontSize: 11, fontWeight: '600' },
  otTag: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  otTagText: { color: '#15803d', fontSize: 11, fontWeight: '600' },
});
