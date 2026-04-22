import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { get, post, put, getUserInfo } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';
// ================= TYPES =================
type IMonthlyRoster = {
  id: number;
  weekday: string;
  dutydate: string;
  morningin: string;
  morningout: string;
  nightin: string;
  nightout: string;
  isoffday: boolean;
  manual_upd_dt: string;
};
type DeptEmployee = {
  id: number;
  employeename: string;
  employeecode: string;
};
// ================= CONSTANTS =================
const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
// ================= HELPERS =================
const convertTo12Hour = (time24: string | null) => {
  if (!time24 || time24 === '00:00:00') return '--';
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr} ${ampm}`;
};
const getDayColor = (weekday: string) => {
  const map: Record<string, string> = {
    Sunday: '#ef4444',
    Monday: '#3b82f6',
    Tuesday: '#6366f1',
    Wednesday: '#8b5cf6',
    Thursday: '#f59e0b',
    Friday: '#10b981',
    Saturday: '#ec4899',
  };
  return map[weekday] || '#64748b';
};
const isZeroTime = (v: string) => !v || v === '00:00:00';
const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
// ================= MAIN COMPONENT =================
const EmpWeeklyRosterScreen = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;   // 1-12
  const currentYear = today.getFullYear();
  // ── Core state ──────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rosterData, setRosterData] = useState<IMonthlyRoster[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  // ── Employee search ──────────────────────────────
  const [dptList, setDptList] = useState<DeptEmployee[]>([]);
  const [dptFiltered, setDptFiltered] = useState<DeptEmployee[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  // ── Month / Year — pre-selected to current ───────
  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const years = useMemo(
    () => Array.from({ length: 7 }, (_, i) => currentYear - 3 + i),
    [currentYear],
  );
  // ── Edit state ───────────────────────────────────
  const [editableRows, setEditableRows] = useState<Record<number, boolean>>({});
  const [updatedData, setUpdatedData] = useState<Partial<Record<number, Partial<IMonthlyRoster>>>>({});
  const [previousTimes, setPreviousTimes] = useState<Record<number, Partial<IMonthlyRoster>>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<IMonthlyRoster | null>(null);
  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserInfo();
      if (user?.employeeId) setEmployeeId(user.employeeId);
    };
    loadUser();
  }, []);
  // ================= LOAD DEPT EMPLOYEES =================
  const loadDeptEmployees = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await get(
        `${API_ENDPOINTS.HRM.GET_EMP_UNDER_DPT}?employeeId=${employeeId}`
      );
      if (res?.success && Array.isArray(res.data)) {
        setDptList(res.data);
        setDptFiltered(res.data);
      } else {
        setDptList([]);
        setDptFiltered([]);
      }
    } catch (err) {
      console.warn('Dept fetch error:', err);
      setDptList([]);
      setDptFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);
  useEffect(() => {
    loadDeptEmployees();
  }, [loadDeptEmployees]);
  // ================= FILTER EMPLOYEES =================
  useEffect(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      setDptFiltered(dptList);
      return;
    }
    setDptFiltered(
      dptList.filter(emp =>
        `${emp.employeename || ''} ${emp.employeecode || ''}`
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [searchValue, dptList]);
  
  // ================= GET MONTHLY ROSTER =================
  const getMonthlyRoster = async () => {
    if (!selectedEmpId) {
      Alert.alert('Warning', 'Please select an employee.');
      return;
    }
    setLoading(true);
    setHasFetched(true);
    setEditableRows({});
    setUpdatedData({});
    try {
      const res = await get(
        `${API_ENDPOINTS.HRM.GET_MONTHLY_ROSTER}?empid=${selectedEmpId}&monthNo=${month}&year=${year}`
      );
      const normalize = (item: any): IMonthlyRoster => ({
        ...item,
        isoffday: item.isoffday ?? item.isOffDay ?? false,
        morningin: item.morningin ?? '00:00:00',
        morningout: item.morningout ?? '00:00:00',
        nightin: item.nightin ?? '00:00:00',
        nightout: item.nightout ?? '00:00:00',
        dutydate: item.dutydate ?? item.date ?? '',
        manual_upd_dt: item.manual_upd_dt ?? item.updated_at ?? '',
      });
      const rows = res?.data ?? res ?? [];
      if (Array.isArray(rows) && rows.length > 0) {
        setRosterData(rows.map(normalize));
        Alert.alert('Success', 'Roster loaded successfully.');
      } else {
        setRosterData([]);
        Alert.alert('Warning', 'Monthly roster not created.');
      }
    } catch (err) {
      console.warn('Roster fetch error:', err);
      setRosterData([]);
    } finally {
      setLoading(false);
    }
  };
  // ================= CREATE YEARLY ROSTER =================
  const createYearlyRoster = async () => {
      Alert.alert('Warning', 'Pelase use web app not allowed mobile app.');
      return;

    if (!selectedEmpId) {
      Alert.alert('Warning', 'Please select an employee.');
      return;
    }
    Alert.alert(
      'Confirm',
      'No roster data available. Do you want to create one?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Create',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await post(
                `${API_ENDPOINTS.HRM.ADD_YEARLY_ROSTER}?empid=${selectedEmpId}&year=${year}`,
                {},
                {} as any
              );

              //const res = await post(API_ENDPOINTS.HRM.SAVE_LEAVE_APPLICATION, body as any, {} as any);
              if (res?.success) {
                Alert.alert('Success', 'Roster saved successfully.');
                getMonthlyRoster();
              }
            } catch (err) {
              console.warn('Create roster error:', err);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  // ================= HANDLE CHANGE =================
  const handleChange = (
    id: number,
    field: keyof IMonthlyRoster,
    value: string | boolean
  ) => {
    setUpdatedData(prev => {
      if (field === 'isoffday' && value === true) {
        const row = rosterData.find(r => r.id === id);
        setPreviousTimes(pt => ({
          ...pt,
          [id]: {
            morningin: prev[id]?.morningin ?? row?.morningin,
            morningout: prev[id]?.morningout ?? row?.morningout,
            nightin: prev[id]?.nightin ?? row?.nightin,
            nightout: prev[id]?.nightout ?? row?.nightout,
          },
        }));
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isoffday: true,
            morningin: '00:00:00',
            morningout: '00:00:00',
            nightin: '00:00:00',
            nightout: '00:00:00',
          },
        };
      }
      if (field === 'isoffday' && value === false) {
        const saved = previousTimes[id] ?? {};
        const row = rosterData.find(r => r.id === id);
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isoffday: false,
            morningin: saved.morningin ?? row?.morningin,
            morningout: saved.morningout ?? row?.morningout,
            nightin: saved.nightin ?? row?.nightin,
            nightout: saved.nightout ?? row?.nightout,
          },
        };
      }
      return { ...prev, [id]: { ...prev[id], [field]: value } };
    });
    setEditableRows(prev => ({ ...prev, [id]: true }));
  };
  // ================= SAVE ROW =================
  const handleSaveRow = async (row: IMonthlyRoster) => {
    const updatedRow = {
      ...row,
      ...(updatedData[row.id] || {}),
    };
    try {
      const res = await put(API_ENDPOINTS.HRM.UPDATE_MONTHLY_ROSTER, updatedRow);
      const isSuccess =
        res?.success === true ||
        res?.data?.success === true ||
        res?.status === 200 ||
        (res !== null && res !== undefined && !res?.error);
      if (isSuccess) {
        setRosterData(prev =>
          prev.map(r =>
            r.id === row.id ? { ...r, ...(updatedData[row.id] || {}) } : r
          )
        );
        setUpdatedData(prev => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });
        setEditableRows(prev => ({ ...prev, [row.id]: false }));
        setEditModalVisible(false);
        setEditingRow(null);
        Alert.alert('Success', `${row.weekday} updated successfully.`);
      } else {
        Alert.alert('Error', `Failed to update ${row.weekday}. Please try again.`);
      }
    } catch (err) {
      console.warn('Save error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  // ================= PULL TO REFRESH =================
  const onRefresh = async () => {
    setRefreshing(true);
    await getMonthlyRoster();
    setRefreshing(false);
  };
  // ================= HELPERS =================
  const getEditValue = (row: IMonthlyRoster, field: keyof IMonthlyRoster) =>
    (updatedData[row.id]?.[field] ?? row[field] ?? '') as string;
  const getOffDayValue = (row: IMonthlyRoster) =>
    !!(updatedData[row.id]?.isoffday ?? row.isoffday);
  const openEditModal = (row: IMonthlyRoster) => {
    setEditingRow(row);
    setEditModalVisible(true);
  };
  // ================= EDIT MODAL =================
  const renderEditModal = () => {
    if (!editingRow) return null;
    const row = editingRow;
    const isOff = getOffDayValue(row);
    const timeFields: { label: string; field: keyof IMonthlyRoster }[] = [
      { label: 'Day In', field: 'morningin' },
      { label: 'Day Out', field: 'morningout' },
      { label: 'Night In', field: 'nightin' },
      { label: 'Night Out', field: 'nightout' },
    ];
    return (
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{row.weekday}</Text>
                <Text style={styles.modalSubtitle}>{formatDate(row.dutydate)}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Off Day Toggle */}
              <View style={styles.offDayRow}>
                <Text style={styles.offDayLabel}>Off Day</Text>
                <TouchableOpacity
                  style={[styles.toggle, isOff && styles.toggleOn]}
                  onPress={() => handleChange(row.id, 'isoffday', !isOff)}
                >
                  <View style={[styles.toggleThumb, isOff && styles.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
              {/* Time Fields */}
              {timeFields.map(({ label, field }) => {
                const val = getEditValue(row, field);
                const isZero = isZeroTime(val);
                return (
                  <View key={field} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <TextInput
                      style={[
                        styles.timeInput,
                        isZero && styles.timeInputZero,
                        isOff && styles.timeInputDisabled,
                      ]}
                      value={val === '00:00:00' ? '' : val.slice(0, 5)}
                      placeholder="HH:MM"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numbers-and-punctuation"
                      editable={!isOff}
                      onChangeText={text => {
                        const formatted = text.length === 5 ? `${text}:00` : text;
                        handleChange(row.id, field, formatted);
                      }}
                    />
                    {!isZero && !isOff && (
                      <TouchableOpacity
                        onPress={() => handleChange(row.id, field, '00:00:00')}
                        style={styles.clearBtn}
                      >
                        <Text style={styles.clearBtnText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveModalBtn,
                  !editableRows[row.id] && styles.saveBtnDisabled,
                ]}
                onPress={() => handleSaveRow(row)}
                disabled={!editableRows[row.id]}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  // ================= RENDER CARD =================
  const renderItem = ({ item }: { item: IMonthlyRoster }) => {
    const color = getDayColor(item.weekday);
    const isOff = getOffDayValue(item);
    const isDirty = editableRows[item.id];
    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.weekday}>{item.weekday}</Text>
            <Text style={styles.dutyDate}>{formatDate(item.dutydate)}</Text>
          </View>
          <View style={styles.headerRight}>
            {isDirty && <View style={styles.dirtyDot} />}
            <View style={[styles.badge, { backgroundColor: isOff ? '#94a3b8' : '#22c55e' }]}>
              <Text style={styles.badgeText}>{isOff ? 'OFF DAY' : 'WORKING'}</Text>
            </View>
          </View>
        </View>
        {/* Times */}
        <View style={styles.timeSection}>
          {[
            { label: 'Day In', field: 'morningin' },
            { label: 'Day Out', field: 'morningout' },
            { label: 'Night In', field: 'nightin' },
            { label: 'Night Out', field: 'nightout' },
          ].map(({ label, field }) => {
            const val = getEditValue(item, field as keyof IMonthlyRoster);
            return (
              <View key={field} style={styles.timeBlock}>
                <Text style={styles.timeLabel}>{label}</Text>
                <Text style={[styles.timeValue, isZeroTime(val) && styles.zeroTime]}>
                  {convertTo12Hour(val)}
                </Text>
              </View>
            );
          })}
        </View>
        {/* Action Row */}
        <View style={styles.actionRow}>
          <Text style={styles.updatedAt}>
            {item.manual_upd_dt ? `Updated: ${item.manual_upd_dt}` : ''}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            {isDirty && (
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveRow(item)}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };
  // ================= MAIN RENDER =================
  return (
    <View style={styles.container}>
      {/* ══════════════ SEARCH SECTION ══════════════ */}
      <View style={styles.searchSection}>
        {/* Employee Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee by name or code..."
          placeholderTextColor="#94a3b8"
          value={searchValue}
          onChangeText={text => {
            setSearchValue(text);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {/* Employee Dropdown */}
        {showDropdown && searchValue.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={dptFiltered}
              keyExtractor={item => item.id.toString()}
              style={{ maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedEmpId(item.id);
                    setSearchValue(`${item.employeename} (${item.employeecode})`);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownName}>{item.employeename}</Text>
                  <Text style={styles.dropdownCode}>{item.employeecode}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.dropdownEmpty}>No employee found</Text>
              }
            />
          </View>
        )}
        {/* Month / Year / Button Row */}
        <View style={styles.filterRow}>
          {/* ── Month Picker ── */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={month}
              onValueChange={(val: number) => setMonth(val)}
              style={styles.picker}
              dropdownIconColor="#64748b"
              mode="dropdown"
            >
              {MONTH_NAMES.map((name, i) => (
                <Picker.Item
                  key={i + 1}
                  label={name}
                  value={i + 1}
                  color="#0f172a"
                />
              ))}
            </Picker>
          </View>
          {/* ── Year Picker ── */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={year}
              onValueChange={(val: number) => setYear(val)}
              style={styles.picker}
              dropdownIconColor="#64748b"
              mode="dropdown"
            >
              {years.map(y => (
                <Picker.Item
                  key={y}
                  label={String(y)}
                  value={y}
                  color="#0f172a"
                />
              ))}
            </Picker>
          </View>
          {/* ── Get Schedule Button ── */}
          <TouchableOpacity style={styles.fetchBtn} onPress={getMonthlyRoster}>
            <Text style={styles.fetchBtnText}>Get Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* ══════════════ END SEARCH SECTION ══════════════ */}
      {/* ── CONTENT ── */}
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
      ) : hasFetched && rosterData.length === 0 ? (
        <TouchableOpacity style={styles.createRosterBtn} onPress={createYearlyRoster}>
          <Text style={styles.createRosterText}>
            No roster data available. Tap to create one.
          </Text>
        </TouchableOpacity>
      ) : rosterData.length === 0 ? (
        <Text style={styles.empty}>
          Search and select an employee, then choose month and year to view their roster.
        </Text>
      ) : (
        <FlatList
          data={rosterData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      {/* ── MODAL ── */}
      {renderEditModal()}
    </View>
  );
};
export default EmpWeeklyRosterScreen;
// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  // ── Search section ────────────────────────────────
  searchSection: {
    marginBottom: 16,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    elevation: 2,
  },
  // ── Employee dropdown ─────────────────────────────
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    elevation: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  dropdownCode: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dropdownEmpty: {
    padding: 14,
    color: '#94a3b8',
    fontSize: 13,
  },
  // ── Filter row (month + year + button) ───────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // ── Picker wrapper — styled like a <select> box ──
  pickerWrapper: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    marginVertical: -4,   // trim Android's built-in internal padding
    color: '#0f172a',
  },
  // ── Fetch button ──────────────────────────────────
  fetchBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fetchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  // ── Empty / Create ────────────────────────────────
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  createRosterBtn: {
    marginTop: 40,
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 4,
  },
  createRosterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  // ── Roster Card ───────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dirtyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  weekday: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  dutyDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeBlock: {
    width: '47%',
  },
  timeLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  zeroTime: {
    color: '#f87171',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  updatedAt: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  // ── Edit Modal ────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  modalClose: {
    fontSize: 18,
    color: '#94a3b8',
    padding: 4,
  },
  offDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  offDayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: '#22c55e',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  fieldLabel: {
    width: 80,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeInputZero: {
    backgroundColor: '#fff1f2',
    borderColor: '#fca5a5',
    color: '#ef4444',
  },
  timeInputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  saveModalBtn: {
    flex: 2,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveBtnDisabled: {
    backgroundColor: '#c7d2fe',
    elevation: 0,
    shadowOpacity: 0,
  },
});
