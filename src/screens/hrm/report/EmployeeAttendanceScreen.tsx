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
import { get,post, getUserInfo } from '../../../config/apiHelper';
import { API_ENDPOINTS } from '../../../config/apiRoutes';

// ================= TYPES =================
type DeptEmployee = {
  id: number;
  employeename: string;
  employeecode: string;
};

type EmployeeInfo = {
  name: string;
  designation: string;
  department: string;
  grade: string;
  joinDate: string;
  employeeCode: string;
};

type RosterRow = {
  sl: number;
  date: string;
  day: string;
  rosterMorningIn: string;
  actualMorningIn: string;
  rosterMorningOut: string;
  actualMorningOut: string;
  rosterNightIn: string;
  actualNightIn: string;
  rosterNightOut: string;
  actualNightOut: string;
  rosterOfficeHours: string;
  totalWorkingHours: string;
  workedMinutes: number;
  scheduledMinutes: number;
  LeaveType: string | null;
  WorkStatus: string;
  isOffDay: boolean;
  HolidayName: string | null;
};

// ================= CONSTANTS =================
const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

// ================= HELPERS =================
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildCalendarDays = (date: Date): (number | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present': return { bg: '#dcfce7', text: '#16a34a' };
    case 'Absent': return { bg: '#fee2e2', text: '#dc2626' };
    case 'Off Day': return { bg: '#f1f5f9', text: '#64748b' };
    case 'Holiday': return { bg: '#fef9c3', text: '#ca8a04' };
    case 'Leave': return { bg: '#dbeafe', text: '#2563eb' };
    default: return { bg: '#f1f5f9', text: '#475569' };
  }
};

const getDayColor = (weekday: string) => {
  const map: Record<string, string> = {
    Sunday: '#ef4444', Monday: '#3b82f6', Tuesday: '#6366f1',
    Wednesday: '#8b5cf6', Thursday: '#f59e0b', Friday: '#10b981', Saturday: '#ec4899',
  };
  return map[weekday] || '#64748b';
};

const minutesToHM = (mins: number) => {
  const abs = Math.abs(mins);
  return `${Math.floor(abs / 60)}h ${abs % 60}m`;
};

// ================= MAIN COMPONENT =================
const EmpAttendanceReportScreen = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // ── Auth ──────────────────────────────────────────
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  // ── Employee search ───────────────────────────────
  const [dptList, setDptList] = useState<DeptEmployee[]>([]);
  const [dptFiltered, setDptFiltered] = useState<DeptEmployee[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  // ── Date range ────────────────────────────────────
  const firstOfMonth = toLocalDateString(new Date(currentYear, currentMonth - 1, 1));
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(toLocalDateString(today));

  // ── Date picker modal ─────────────────────────────
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  // ── Loading / error ───────────────────────────────
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  // ── Results ───────────────────────────────────────
  const [empMonthlyRoster, setEmpMonthlyRoster] = useState<RosterRow[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // ── Detail modal ──────────────────────────────────
  const [detailRow, setDetailRow] = useState<RosterRow | null>(null);

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
    try {
      const res = await get(`${API_ENDPOINTS.HRM.GET_EMP_UNDER_DPT}?employeeId=${employeeId}`);
      if (res?.success && Array.isArray(res.data)) {
        setDptList(res.data);
        setDptFiltered(res.data);
      }
    } catch (err) {
      console.warn('Dept fetch error:', err);
    }
  }, [employeeId]);

  useEffect(() => { loadDeptEmployees(); }, [loadDeptEmployees]);

  // ================= FILTER EMPLOYEES =================
  useEffect(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) { setDptFiltered(dptList); return; }
    setDptFiltered(
      dptList.filter(emp =>
        `${emp.employeename || ''} ${emp.employeecode || ''}`.toLowerCase().includes(keyword)
      )
    );
  }, [searchValue, dptList]);

  // ================= FILTER / FETCH =================
  const onFilterData = useCallback(async () => {
    if (!startDate || !endDate) {
      setDateError('Both Start Date and End Date are required.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setDateError('Start Date must be earlier than End Date.');
      return;
    }
    if (!selectedEmpId) {
      setDateError('Please select an employee.');
      return;
    }
    setDateError('');
    setLoading(true);
    setHasFetched(true);

    try {
      const res = await post(`${API_ENDPOINTS.HRM.GET_ATTENDANCE_DETAIL_REPORT}?empId=${selectedEmpId}&fromDate=${startDate}&toDate=${endDate}` ,{},{} as any);

      const rawData = res?.data ?? res;
      if (!rawData) { setLoading(false); return; }

      const { reportData, employeeData } = rawData;
      const list: any[] = Array.isArray(reportData) ? reportData : [];

      // ── Employee info ──
      setEmployeeInfo({
        name: employeeData?.employeename ?? '',
        designation: employeeData?.designationname ?? '',
        department: employeeData?.departmentname ?? '',
        grade: employeeData?.gradeid ?? '',
        joinDate: employeeData?.joineddate ?? '',
        employeeCode: employeeData?.employeecode ?? '',
      });

      // ── Map rows — handles both camelCase and lowercase field names ──
      const converted: RosterRow[] = list.map((item, index) => {
        const worked = Math.abs(parseInt(
          item.workedminutes ?? item.workedMinutes ?? 0
        ));
        const scheduled = Math.abs(parseInt(
          item.scheduledminutes ?? item.scheduledMinutes ?? 0
        ));

        const workdate = item.workdate ?? item.workDate ?? '';
        const formattedDate = workdate
          ? (() => {
              const [y, m, d] = workdate.split('-');
              return `${d}-${m}-${y.slice(-2)}`;
            })()
          : '-';

        return {
          sl: index + 1,
          date: formattedDate,
          day: item.weekday ?? item.weekDay ?? '',
          rosterMorningIn: item.scheduledmorningin ?? item.scheduledMorningIn ?? '-',
          actualMorningIn: item.actualmorningin ?? item.actualMorningIn ?? '-',
          rosterMorningOut: item.scheduledmorningout ?? item.scheduledMorningOut ?? '-',
          actualMorningOut: item.actualmorningout ?? item.actualMorningOut ?? '-',
          rosterNightIn: item.schedulednightin ?? item.scheduledNightIn ?? '-',
          actualNightIn: item.actualnightin ?? item.actualNightIn ?? '-',
          rosterNightOut: item.schedulednightout ?? item.scheduledNightOut ?? '-',
          actualNightOut: item.actualnightout ?? item.actualNightOut ?? '-',
          rosterOfficeHours: scheduled > 0 ? minutesToHM(scheduled) : '0h 0m',
          totalWorkingHours: worked > 0 ? minutesToHM(worked) : '0h 0m',
          workedMinutes: worked,
          scheduledMinutes: scheduled,
          LeaveType: item.leavetype ?? item.leaveType ?? null,
          WorkStatus: item.workstatus ?? item.workStatus ?? '',
          isOffDay: item.isoffday ?? item.isOffDay ?? false,
          HolidayName: item.holidayname ?? item.holidayName ?? null,
        };
      });

      setEmpMonthlyRoster(converted);
    } catch (err) {
      console.warn('Report fetch error:', err);
      Alert.alert('Error', 'Failed to fetch report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedEmpId]);

  // ================= DATE PICKER MODAL =================
  const renderDatePicker = () => (
    <Modal transparent animationType="fade" visible={activePicker !== null}>
      <TouchableOpacity style={styles.datePickerOverlay} onPress={() => setActivePicker(null)} />
      <View style={styles.datePickerBox}>
        <Text style={styles.datePickerTitle}>
          {activePicker === 'start' ? 'Select Start Date' : 'Select End Date'}
        </Text>

        {/* Month Nav */}
        <View style={styles.dateNavRow}>
          <TouchableOpacity
            style={styles.dateNavBtn}
            onPress={() => { const d = new Date(pickerDate); d.setMonth(d.getMonth() - 1); setPickerDate(d); }}
          >
            <Text style={styles.dateNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateNavLabel}>
            {pickerDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            style={styles.dateNavBtn}
            onPress={() => { const d = new Date(pickerDate); d.setMonth(d.getMonth() + 1); setPickerDate(d); }}
          >
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayGrid}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}

          {buildCalendarDays(pickerDate).map((day, i) => {
            const y = pickerDate.getFullYear();
            const m = String(pickerDate.getMonth() + 1).padStart(2, '0');
            const dStr = day ? String(day).padStart(2, '0') : '';
            const fullDate = day ? `${y}-${m}-${dStr}` : '';
            const currentVal = activePicker === 'start' ? startDate : endDate;
            const isSelected = fullDate === currentVal;
            const isToday =
              day !== null &&
              new Date().getDate() === day &&
              new Date().getMonth() === pickerDate.getMonth() &&
              new Date().getFullYear() === pickerDate.getFullYear();

            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayCell, isSelected && styles.dayCellSelected, isToday && !isSelected && styles.dayCellToday]}
                onPress={() => {
                  if (!day) return;
                  if (activePicker === 'start') setStartDate(fullDate);
                  else setEndDate(fullDate);
                  setActivePicker(null);
                }}
                disabled={!day}
              >
                <Text style={[
                  styles.dayCellText,
                  isSelected && styles.dayCellTextSelected,
                  isToday && !isSelected && styles.dayCellTextToday,
                  !day && { opacity: 0 },
                ]}>
                  {day ?? ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.datePickerCancel} onPress={() => setActivePicker(null)}>
          <Text style={styles.datePickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  // ================= DETAIL MODAL =================
  const renderDetailModal = () => {
    if (!detailRow) return null;
    const statusColor = getStatusColor(detailRow.WorkStatus);
    const dayColor = getDayColor(detailRow.day);
    const isShort = detailRow.workedMinutes < detailRow.scheduledMinutes && detailRow.scheduledMinutes > 0;

    const infoRows = [
      { label: 'Roster Morning In', value: detailRow.rosterMorningIn },
      { label: 'Actual Morning In', value: detailRow.actualMorningIn },
      { label: 'Roster Morning Out', value: detailRow.rosterMorningOut },
      { label: 'Actual Morning Out', value: detailRow.actualMorningOut },
      { label: 'Roster Night In', value: detailRow.rosterNightIn },
      { label: 'Actual Night In', value: detailRow.actualNightIn },
      { label: 'Roster Night Out', value: detailRow.rosterNightOut },
      { label: 'Actual Night Out', value: detailRow.actualNightOut },
      { label: 'Office Hours', value: detailRow.rosterOfficeHours },
      { label: 'Working Hours', value: detailRow.totalWorkingHours },
    ];

    return (
      <Modal visible={detailRow !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderLeftColor: dayColor, borderLeftWidth: 4, paddingLeft: 12 }]}>
              <View>
                <Text style={styles.modalTitle}>{detailRow.day}</Text>
                <Text style={styles.modalSubtitle}>{detailRow.date}</Text>
              </View>
              <View style={styles.modalHeaderRight}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                    {detailRow.WorkStatus}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDetailRow(null)} style={{ marginLeft: 10 }}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Holiday / Leave tag */}
            {(detailRow.HolidayName || detailRow.LeaveType) && (
              <View style={styles.remarkTag}>
                <Text style={styles.remarkTagText}>
                  {[detailRow.HolidayName, detailRow.LeaveType].filter(Boolean).join(' | ')}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {infoRows.map(({ label, value }) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={[
                    styles.detailValue,
                    (!value || value === '-' || value === null) && styles.detailValueEmpty,
                  ]}>
                    {value && value !== 'null' ? value : '--'}
                  </Text>
                </View>
              ))}

              {/* Working hours summary */}
              <View style={[styles.hoursBar, { backgroundColor: isShort ? '#fee2e2' : '#dcfce7' }]}>
                <Text style={[styles.hoursBarText, { color: isShort ? '#dc2626' : '#16a34a' }]}>
                  {isShort ? '⚠ Short Hours' : '✓ Hours OK'}
                  {'  '}
                  Worked: {detailRow.totalWorkingHours} / Scheduled: {detailRow.rosterOfficeHours}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailRow(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ================= RENDER ROW =================
  const renderItem = ({ item }: { item: RosterRow }) => {
    const statusColor = getStatusColor(item.WorkStatus);
    const dayColor = getDayColor(item.day);
    const isShort = item.workedMinutes < item.scheduledMinutes && item.scheduledMinutes > 0;

    return (
      <TouchableOpacity
        style={[styles.row, { borderLeftColor: dayColor }]}
        onPress={() => setDetailRow(item)}
        activeOpacity={0.75}
      >
        {/* Left: SL + Date + Day */}
        <View style={styles.rowLeft}>
          <Text style={styles.rowSl}>#{item.sl}</Text>
          <Text style={styles.rowDate}>{item.date}</Text>
          <Text style={[styles.rowDay, { color: dayColor }]}>{item.day}</Text>
        </View>

        {/* Middle: Shift times */}
        <View style={styles.rowMiddle}>
          {/* Day shift */}
          {(item.rosterMorningIn !== '-' || item.rosterMorningOut !== '-') && (
            <View style={styles.shiftBlock}>
              <Text style={styles.shiftLabel}>☀ Day</Text>
              <Text style={styles.shiftTime}>
                {item.rosterMorningIn !== '-' ? item.rosterMorningIn.slice(0, 5) : '--'}
                {' → '}
                {item.rosterMorningOut !== '-' ? item.rosterMorningOut.slice(0, 5) : '--'}
              </Text>
              <Text style={styles.actualTime}>
                {item.actualMorningIn !== '-' ? item.actualMorningIn.slice(0, 5) : '--'}
                {' → '}
                {item.actualMorningOut !== '-' ? item.actualMorningOut.slice(0, 5) : '--'}
              </Text>
            </View>
          )}
          {/* Night shift */}
          {(item.rosterNightIn !== '-' || item.rosterNightOut !== '-') && (
            <View style={styles.shiftBlock}>
              <Text style={styles.shiftLabel}>🌙 Night</Text>
              <Text style={styles.shiftTime}>
                {item.rosterNightIn !== '-' ? item.rosterNightIn.slice(0, 5) : '--'}
                {' → '}
                {item.rosterNightOut !== '-' ? item.rosterNightOut.slice(0, 5) : '--'}
              </Text>
              <Text style={styles.actualTime}>
                {item.actualNightIn !== '-' ? item.actualNightIn.slice(0, 5) : '--'}
                {' → '}
                {item.actualNightOut !== '-' ? item.actualNightOut.slice(0, 5) : '--'}
              </Text>
            </View>
          )}
          {/* Off day / Holiday */}
          {item.isOffDay && (
            <Text style={styles.offLabel}>Off Day</Text>
          )}
          {item.HolidayName && (
            <Text style={styles.holidayLabel}>{item.HolidayName}</Text>
          )}
        </View>

        {/* Right: Hours + Status */}
        <View style={styles.rowRight}>
          <Text style={[styles.workedHours, { color: isShort ? '#dc2626' : '#16a34a' }]}>
            {item.totalWorkingHours}
          </Text>
          <Text style={styles.scheduledHours}>{item.rosterOfficeHours}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg, marginTop: 6 }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
              {item.WorkStatus}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ================= EMPLOYEE INFO CARD =================
  const renderEmployeeInfo = () => {
    if (!employeeInfo) return null;
    return (
      <View style={styles.empCard}>
        <View style={styles.empCardLeft}>
          <View style={styles.empAvatar}>
            <Text style={styles.empAvatarText}>
              {employeeInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.empCardRight}>
          <Text style={styles.empName}>{employeeInfo.name}</Text>
          <Text style={styles.empSub}>{employeeInfo.designation} · {employeeInfo.department}</Text>
          <Text style={styles.empSub}>Code: {employeeInfo.employeeCode} · Grade: {employeeInfo.grade}</Text>
        </View>
      </View>
    );
  };

  // ================= SUMMARY BAR =================
  const summary = useMemo(() => {
    if (!empMonthlyRoster.length) return null;
    const present = empMonthlyRoster.filter(r => r.WorkStatus === 'Present').length;
    const absent = empMonthlyRoster.filter(r => r.WorkStatus === 'Absent').length;
    const offDay = empMonthlyRoster.filter(r => r.WorkStatus === 'Off Day').length;
    const holiday = empMonthlyRoster.filter(r => r.WorkStatus === 'Holiday').length;
    return { present, absent, offDay, holiday };
  }, [empMonthlyRoster]);

  const renderSummary = () => {
    if (!summary) return null;
    const items = [
      { label: 'Present', value: summary.present, color: '#16a34a', bg: '#dcfce7' },
      { label: 'Absent', value: summary.absent, color: '#dc2626', bg: '#fee2e2' },
      { label: 'Off Day', value: summary.offDay, color: '#64748b', bg: '#f1f5f9' },
      { label: 'Holiday', value: summary.holiday, color: '#ca8a04', bg: '#fef9c3' },
    ];
    return (
      <View style={styles.summaryRow}>
        {items.map(({ label, value, color, bg }) => (
          <View key={label} style={[styles.summaryCard, { backgroundColor: bg }]}>
            <Text style={[styles.summaryValue, { color }]}>{value}</Text>
            <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ================= MAIN RENDER =================
  return (
    <View style={styles.container}>

      {/* ══ SEARCH + FILTER SECTION ══ */}
      <View style={styles.searchSection}>

        {/* Employee Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee by name or code..."
          placeholderTextColor="#94a3b8"
          value={searchValue}
          onChangeText={text => { setSearchValue(text); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
        />

        {/* Employee Dropdown */}
        {showDropdown && searchValue.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={dptFiltered}
              keyExtractor={item => item.id.toString()}
              style={{ maxHeight: 180 }}
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
              ListEmptyComponent={<Text style={styles.dropdownEmpty}>No employee found</Text>}
            />
          </View>
        )}

        {/* Date Row */}
        <View style={styles.dateRow}>

          {/* From Date */}
          <View style={styles.dateField}>
            <Text style={styles.dateFieldLabel}>From</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => { setPickerDate(new Date(startDate)); setActivePicker('start'); }}
            >
              <Text style={styles.dateBtnText}>📅 {formatDisplayDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View style={styles.dateField}>
            <Text style={styles.dateFieldLabel}>To</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => { setPickerDate(new Date(endDate)); setActivePicker('end'); }}
            >
              <Text style={styles.dateBtnText}>📅 {formatDisplayDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Error */}
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

        {/* Filter Button */}
        <TouchableOpacity style={styles.fetchBtn} onPress={onFilterData} disabled={loading}>
          <Text style={styles.fetchBtnText}>
            {loading ? 'Loading...' : '🔍  Get Report'}
          </Text>
        </TouchableOpacity>

      </View>
      {/* ══ END FILTER SECTION ══ */}

      {/* ── CONTENT ── */}
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
      ) : hasFetched && empMonthlyRoster.length === 0 ? (
        <Text style={styles.empty}>No report data found for the selected period.</Text>
      ) : !hasFetched ? (
        <Text style={styles.empty}>Select an employee and date range, then tap Get Report.</Text>
      ) : (
        <FlatList
          data={empMonthlyRoster}
          keyExtractor={item => item.sl.toString()}
          ListHeaderComponent={
            <>
              {renderEmployeeInfo()}
              {renderSummary()}
              {/* Column headers */}
              <View style={styles.tableHeader}>
                <Text style={[styles.thSl]}>#</Text>
                <Text style={[styles.thDate]}>Date / Day</Text>
                <Text style={[styles.thShift]}>Shift Times</Text>
                <Text style={[styles.thHours]}>Hours / Status</Text>
              </View>
            </>
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* ── MODALS ── */}
      {renderDatePicker()}
      {renderDetailModal()}

    </View>
  );
};

export default EmpAttendanceReportScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingTop: 16,
  },

  // ── Search / Filter ───────────────────────────────
  searchSection: {
    marginBottom: 12,
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
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  dropdownCode: { fontSize: 12, color: '#64748b', marginTop: 2 },
  dropdownEmpty: { padding: 14, color: '#94a3b8', fontSize: 13 },

  // ── Date row ──────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dateField: { flex: 1 },
  dateFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    marginLeft: 2,
  },
  dateBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  dateBtnText: { fontSize: 13, color: '#1e293b', fontWeight: '500' },

  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },

  fetchBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fetchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },

  // ── Employee card ──────────────────────────────────
  empCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
    gap: 12,
  },
  empCardLeft: {},
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  empCardRight: { flex: 1 },
  empName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  empSub: { fontSize: 12, color: '#64748b', marginTop: 2 },

  // ── Summary bar ───────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // ── Table header ──────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  thSl: { width: 30, fontSize: 11, fontWeight: '700', color: '#475569' },
  thDate: { width: 80, fontSize: 11, fontWeight: '700', color: '#475569' },
  thShift: { flex: 1, fontSize: 11, fontWeight: '700', color: '#475569' },
  thHours: { width: 90, fontSize: 11, fontWeight: '700', color: '#475569', textAlign: 'right' },

  // ── Data row ─────────────────────────────────────
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    alignItems: 'flex-start',
  },
  rowLeft: { width: 60, marginRight: 8 },
  rowSl: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  rowDate: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  rowDay: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  rowMiddle: { flex: 1, marginRight: 8 },
  shiftBlock: { marginBottom: 6 },
  shiftLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 1 },
  shiftTime: { fontSize: 12, color: '#334155', fontWeight: '600' },
  actualTime: { fontSize: 11, color: '#64748b', marginTop: 1 },
  offLabel: {
    fontSize: 12, color: '#64748b', fontWeight: '600',
    backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  holidayLabel: {
    fontSize: 11, color: '#ca8a04', fontWeight: '600',
    backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start', marginTop: 4,
  },

  rowRight: { width: 90, alignItems: 'flex-end' },
  workedHours: { fontSize: 13, fontWeight: '800' },
  scheduledHours: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },

  // ── Empty ─────────────────────────────────────────
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // ── Date Picker ───────────────────────────────────
  datePickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  datePickerBox: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  datePickerTitle: {
    fontSize: 16, fontWeight: '700', color: '#0f172a',
    textAlign: 'center', marginBottom: 16,
  },
  dateNavRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  dateNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
  },
  dateNavText: { fontSize: 22, color: '#475569', lineHeight: 26 },
  dateNavLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: {
    width: '14.28%', textAlign: 'center', fontSize: 12,
    fontWeight: '600', color: '#94a3b8', paddingVertical: 6,
  },
  dayCell: {
    width: '14.28%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center', borderRadius: 20,
  },
  dayCellSelected: { backgroundColor: '#4f46e5' },
  dayCellToday: { backgroundColor: '#ede9fe' },
  dayCellText: { fontSize: 14, color: '#1e293b' },
  dayCellTextSelected: { color: '#fff', fontWeight: '700' },
  dayCellTextToday: { color: '#4f46e5', fontWeight: '700' },
  datePickerCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  datePickerCancelText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },

  // ── Detail Modal ──────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  modalClose: { fontSize: 18, color: '#94a3b8', padding: 4 },

  remarkTag: {
    backgroundColor: '#fef9c3', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 6,
  },
  remarkTagText: { fontSize: 12, color: '#92400e', fontWeight: '600' },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9',
  },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#0f172a', fontWeight: '600' },
  detailValueEmpty: { color: '#cbd5e1' },

  hoursBar: {
    borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 4,
  },
  hoursBarText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  closeBtn: {
    backgroundColor: '#4f46e5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
