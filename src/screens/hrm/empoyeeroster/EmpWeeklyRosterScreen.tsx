import React, { useEffect, useState, useCallback } from 'react';
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
import { get, post, put, getUserInfo } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';

// ================= TYPES =================
type WeeklyRosterDto = {
  id: number;
  weekday: string;
  dayno: number;
  morningin: string;
  morningout: string;
  eveningin: string;
  eveningout: string;
  nightin: string;
  nightout: string;
  isOffDay: boolean;
  updated_at: string;
};

type DeptEmployee = {
  id: number;
  employeename: string;
  employeecode: string;
};

// ================= HELPERS =================
const convertTo12Hour = (time24: string | null) => {
  if (!time24 || time24 === '00:00:00') return '--';
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr} ${ampm}`;
};

const getDayColor = (dayno: number) => {
  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#f59e0b', '#10b981', '#ef4444',
  ];
  return colors[dayno - 1] || '#64748b';
};

const isZeroTime = (v: string) => !v || v === '00:00:00';

const buildCalendarDays = (date: Date): (number | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

// ================= MAIN COMPONENT =================
const EmpWeeklyRosterScreen = () => {
  // ── Core state ──────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rosterData, setRosterData] = useState<WeeklyRosterDto[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  // ── Employee search ──────────────────────────────
  const [dptList, setDptList] = useState<DeptEmployee[]>([]);
  const [dptFiltered, setDptFiltered] = useState<DeptEmployee[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  // ── Date picker ──────────────────────────────────
  const [applyDate, setApplyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());

  // ── Edit state ───────────────────────────────────
  const [editableRows, setEditableRows] = useState<Record<number, boolean>>({});
  const [updatedData, setUpdatedData] = useState<Partial<Record<number, Partial<WeeklyRosterDto>>>>({});
  const [previousTimes, setPreviousTimes] = useState<Record<number, Partial<WeeklyRosterDto>>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<WeeklyRosterDto | null>(null);

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
      }
    } catch (err) {
      console.warn('Dept fetch error:', err);
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
        `${emp.employeename} ${emp.employeecode}`
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [searchValue, dptList]);

  // ================= GET ROSTER =================
  const getRoster = async () => {
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
        `${API_ENDPOINTS.HRM.GET_WEEKLY_ROSTER}?empid=${selectedEmpId}`
      );

      const normalize = (item: any): WeeklyRosterDto => ({
        ...item,
        isOffDay: item.isOffDay ?? item.isoffday ?? false,
        morningin: item.morningin ?? '00:00:00',
        morningout: item.morningout ?? '00:00:00',
        eveningin: item.eveningin ?? '00:00:00',
        eveningout: item.eveningout ?? '00:00:00',
        nightin: item.nightin ?? '00:00:00',
        nightout: item.nightout ?? '00:00:00',
      });

      const rows = res?.data ?? res ?? [];

      if (Array.isArray(rows) && rows.length > 0) {
        setRosterData(rows.map(normalize));
      } else {
        setRosterData([]);
        Alert.alert('No Roster', 'No roster found. Please create one.');
      }
    } catch (err) {
      console.warn('Roster fetch error:', err);
      setRosterData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE ROSTER =================
  /*
  const createWeeklyRoster = async () => {
    if (!selectedEmpId) {
      Alert.alert('Warning', 'Please select an employee.');
      return;
    }
    Alert.alert(
      'Confirm',
      'Do you want to create a roster for this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Create',
          onPress: async () => {
            try {
              const res = await post(`${API_ENDPOINTS.HRM.ADD_WEEKLY_ROSTER}?empid=${selectedEmpId}`,{});
              if (res?.success) {
                Alert.alert('Success', 'Roster created successfully.');
                getRoster();
              }
            } catch (err) {
              console.warn('Create roster error:', err);
            }
          },
        },
      ]
    );
  };
  */

  // ================= HANDLE CHANGE =================
  const handleChange = (
    id: number,
    field: keyof WeeklyRosterDto,
    value: string | boolean
  ) => {
    setUpdatedData(prev => {
      if (field === 'isOffDay' && value === true) {
        const row = rosterData.find(r => r.id === id);
        setPreviousTimes(pt => ({
          ...pt,
          [id]: {
            morningin: prev[id]?.morningin ?? row?.morningin,
            morningout: prev[id]?.morningout ?? row?.morningout,
            eveningin: prev[id]?.eveningin ?? row?.eveningin,
            eveningout: prev[id]?.eveningout ?? row?.eveningout,
            nightin: prev[id]?.nightin ?? row?.nightin,
            nightout: prev[id]?.nightout ?? row?.nightout,
          },
        }));
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isOffDay: true,
            morningin: '00:00:00',
            morningout: '00:00:00',
            eveningin: '00:00:00',
            eveningout: '00:00:00',
            nightin: '00:00:00',
            nightout: '00:00:00',
          },
        };
      }
      if (field === 'isOffDay' && value === false) {
        return {
          ...prev,
          [id]: { ...prev[id], ...previousTimes[id], isOffDay: false },
        };
      }
      return { ...prev, [id]: { ...prev[id], [field]: value } };
    });
    setEditableRows(prev => ({ ...prev, [id]: true }));
  };

  // ================= SAVE ROW =================
 const handleSaveRow = async (row: WeeklyRosterDto) => {
  const updatedRow = {
    ...row,
    ...(updatedData[row.id] || {}),
    applyDate,
  };

  try {
    console.log('Sending update:', JSON.stringify(updatedRow, null, 2));

    const res = await put(API_ENDPOINTS.HRM.UPDATE_EMP_WEEKLY_ROSTER, updatedRow);

    console.log('Update response:', JSON.stringify(res, null, 2));

    // ✅ Accept any truthy response — handles all shapes:
    // { success: true }
    // { data: { success: true } }
    // { status: 200 }
    // true / any non-null response
    const isSuccess =
      res?.success === true ||
      res?.data?.success === true ||
      res?.status === 200 ||
      res?.status === true ||
      (res !== null && res !== undefined && !res?.error);

    if (isSuccess) {
      // Sync the card display with saved values
      setRosterData(prev =>
        prev.map(r =>
          r.id === row.id ? { ...r, ...(updatedData[row.id] || {}) } : r
        )
      );
      // Clear pending edits for this row
      setUpdatedData(prev => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      // Disable save button
      setEditableRows(prev => ({ ...prev, [row.id]: false }));
      // Close modal
      setEditModalVisible(false);
      setEditingRow(null);

      Alert.alert('Success', `${row.weekday} updated successfully.`);
    } else {
      console.warn('Update not confirmed:', res);
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
    await getRoster();
    setRefreshing(false);
  };

  // ================= HELPERS =================
  const getEditValue = (row: WeeklyRosterDto, field: keyof WeeklyRosterDto) =>
    (updatedData[row.id]?.[field] ?? row[field] ?? '') as string;

  const getOffDayValue = (row: WeeklyRosterDto) =>
    !!(updatedData[row.id]?.isOffDay ?? row.isOffDay);

  const openEditModal = (row: WeeklyRosterDto) => {
    setEditingRow(row);
    setEditModalVisible(true);
  };

  // ================= DATE PICKER =================
  const renderDatePicker = () => (
    <Modal transparent animationType="fade" visible={showDatePicker}>
      <TouchableOpacity
        style={styles.datePickerOverlay}
        onPress={() => setShowDatePicker(false)}
      />
      <View style={styles.datePickerBox}>
        <Text style={styles.datePickerTitle}>Select Apply Date</Text>

        {/* Month Navigation */}
        <View style={styles.dateNavRow}>
          <TouchableOpacity
            style={styles.dateNavBtn}
            onPress={() => {
              const d = new Date(pickerDate);
              d.setMonth(d.getMonth() - 1);
              setPickerDate(d);
            }}
          >
            <Text style={styles.dateNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateNavLabel}>
            {pickerDate.toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <TouchableOpacity
            style={styles.dateNavBtn}
            onPress={() => {
              const d = new Date(pickerDate);
              d.setMonth(d.getMonth() + 1);
              setPickerDate(d);
            }}
          >
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayGrid}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}

          {/* Day Cells */}
          {buildCalendarDays(pickerDate).map((day, i) => {
            const y = pickerDate.getFullYear();
            const m = String(pickerDate.getMonth() + 1).padStart(2, '0');
            const dStr = day ? String(day).padStart(2, '0') : '';
            const fullDate = day ? `${y}-${m}-${dStr}` : '';
            const isSelected = fullDate === applyDate;
            const isToday =
              day !== null &&
              new Date().getDate() === day &&
              new Date().getMonth() === pickerDate.getMonth() &&
              new Date().getFullYear() === pickerDate.getFullYear();

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => {
                  if (!day) return;
                  setApplyDate(fullDate);
                  setShowDatePicker(false);
                }}
                disabled={!day}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    isSelected && styles.dayCellTextSelected,
                    isToday && !isSelected && styles.dayCellTextToday,
                    !day && { opacity: 0 },
                  ]}
                >
                  {day ?? ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.datePickerCancel}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.datePickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  // ================= EDIT MODAL =================
  const renderEditModal = () => {
    if (!editingRow) return null;
    const row = editingRow;
    const isOff = getOffDayValue(row);

    const timeFields: { label: string; field: keyof WeeklyRosterDto }[] = [
      { label: 'Morning In', field: 'morningin' },
      { label: 'Morning Out', field: 'morningout' },
      { label: 'Evening In', field: 'eveningin' },
      { label: 'Evening Out', field: 'eveningout' },
      { label: 'Night In', field: 'nightin' },
      { label: 'Night Out', field: 'nightout' },
    ];

    return (
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{row.weekday}</Text>
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
                  onPress={() => handleChange(row.id, 'isOffDay', !isOff)}
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
                        const formatted =
                          text.length === 5 ? `${text}:00` : text;
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
  const renderItem = ({ item }: { item: WeeklyRosterDto }) => {
    const color = getDayColor(item.dayno);
    const isOff = getOffDayValue(item);
    const isDirty = editableRows[item.id];

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.weekday}>{item.weekday}</Text>
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
            { label: 'Morning In', field: 'morningin' },
            { label: 'Morning Out', field: 'morningout' },
            { label: 'Night In', field: 'nightin' },
            { label: 'Night Out', field: 'nightout' },
          ].map(({ label, field }) => {
            const val = getEditValue(item, field as keyof WeeklyRosterDto);
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
            {item.updated_at ? `Updated: ${item.updated_at}` : ''}
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

      {/* ── SEARCH SECTION ── */}
      <View style={styles.searchSection}>

        {/* Employee Search */}
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

        {/* Dropdown */}
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
                    setSearchValue(
                      `${item.employeename} (${item.employeecode})`
                    );
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

        {/* Date + Button Row */}
        <View style={styles.filterRow}>

          {/* Date Picker Button */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateBtnIcon}>📅</Text>
            <Text style={styles.dateBtnText}>
              {applyDate
                ? new Date(applyDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : 'Select Date'}
            </Text>
          </TouchableOpacity>

          {/* Get Schedule Button */}
          <TouchableOpacity style={styles.fetchBtn} onPress={getRoster}>
            <Text style={styles.fetchBtnText}>Get Schedule</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* ── CONTENT ── */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4f46e5"
          style={{ marginTop: 40 }}
        />
      ) : rosterData.length === 0 && hasFetched ? (
        <TouchableOpacity
          style={styles.createRosterBtn}
        // onPress={createWeeklyRoster}
        >
          <Text style={styles.createRosterText}>
            No roster found.
          </Text>
        </TouchableOpacity>
      ) : rosterData.length === 0 ? (
        <Text style={styles.empty}>
          Search and select an employee to view their roster.
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

      {/* ── MODALS ── */}
      {renderDatePicker()}
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

  // ── Search section ────────────────────────
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

  // ── Filter row ────────────────────────────
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  dateBtnIcon: {
    fontSize: 15,
  },
  dateBtnText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  fetchBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fetchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Date Picker ───────────────────────────
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  datePickerBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavText: {
    fontSize: 22,
    color: '#475569',
    lineHeight: 26,
  },
  dateNavLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    paddingVertical: 6,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: '#4f46e5',
  },
  dayCellToday: {
    backgroundColor: '#ede9fe',
  },
  dayCellText: {
    fontSize: 14,
    color: '#1e293b',
  },
  dayCellTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayCellTextToday: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  datePickerCancel: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  datePickerCancelText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ── Empty / Create ────────────────────────
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
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
  },

  // ── Roster Card ───────────────────────────
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
    alignItems: 'center',
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

  // ── Edit Modal ────────────────────────────
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
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
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
    width: 90,
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