import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Button, TextInput, Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { post, getUserInfo } from "../../../config/apiHelper";
import { API_ENDPOINTS } from "../../../config/apiRoutes";

type AttendanceItem = {
  workDate: string;
  weekDay: string;
  workStatus: string;
  workedMinutes: number;
  overTime: number;
  lateIn: number | null;
  isOffDay: boolean;
  holidayName: string | null;
  leaveType: string | null;
  scheduledMinutes: number;
  scheduledMorningIn: string | null;
  actualMorningIn: string | null;
  scheduledMorningOut: string | null;
  actualMorningOut: string | null;
};

const AttendanceScreen = () => {
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState<any>(null);
  const [reportHead, setReportHead] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All"); // Default "All"
  const [showFilterChips, setShowFilterChips] = useState(false); // Hide initially

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) {
      Alert.alert("Warning", "Please select From and To dates");
      return;
    }

    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const userId = userInfo?.id;

      const body = {
        Reportid: 16,
        fromDate: formatDate(dateFrom),
        toDate: formatDate(dateTo),
        DataId: userId,
      };

      const empRes = await post(API_ENDPOINTS.HRM.GetMisReportHR, body, {} as any);
      console.log("Full Response:", empRes);

      setHeader(empRes.header);
      setReportHead(empRes.reporthead);
      setAttendanceData(empRes.data ?? []);

      // Show filter chips after generating report
      setShowFilterChips(true);
      setFilterStatus("All"); // default selection

      Alert.alert("Success", "Report generated successfully!");
    } catch (err) {
      console.warn("Failed to generate report:", err);
      Alert.alert("Error", "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: AttendanceItem }) => {
    let statusColor = "#16a34a"; // green for Present
    if (item.isOffDay) statusColor = "#64748b"; // grey
    else if (item.workStatus.toLowerCase() === "late") statusColor = "#f97316"; // orange
    else if (item.workStatus.toLowerCase() === "absent") statusColor = "#ef4444"; // red

    return (
      <View style={styles.rowCard}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowDate}>{item.workDate}</Text>
          <Text style={styles.rowWeek}>{item.weekDay}</Text>
        </View>

        <View style={styles.rowCenter}>
          <Chip style={[styles.statusChip, { backgroundColor: statusColor }]}>
            {item.workStatus}
          </Chip>
          {item.lateIn && <Text style={styles.lateText}>Late: {item.lateIn} min</Text>}
        </View>

        <View style={styles.rowRight}>
          <Text style={styles.rowText}>Worked: {item.workedMinutes} min</Text>
          {/* <Text style={styles.rowText}>OT: {item.overTime} min</Text> */}
          {item.leaveType && <Text style={styles.rowText}>Leave: {item.leaveType}</Text>}
          {item.holidayName && <Text style={styles.rowText}>Holiday: {item.holidayName}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={
          filterStatus === "All"
            ? attendanceData
            : attendanceData.filter(
                (item) => item.workStatus.toLowerCase() === filterStatus.toLowerCase()
              )
        }
        keyExtractor={(item) => item.workDate}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 20 }}
        ListHeaderComponent={
          <>
            {/* Filter Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Attendance Report</Text>

              <TextInput
                label="From Date"
                mode="outlined"
                value={formatDate(dateFrom)}
                onFocus={() => setShowFromPicker(true)}
                style={styles.input}
                outlineColor="#cbd5e1"
                activeOutlineColor="#3b82f6"
              />
              {showFromPicker && (
                <DateTimePicker
                  value={dateFrom || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowFromPicker(Platform.OS === "ios");
                    if (selectedDate) setDateFrom(selectedDate);
                  }}
                />
              )}

              <TextInput
                label="To Date"
                mode="outlined"
                value={formatDate(dateTo)}
                onFocus={() => setShowToPicker(true)}
                style={styles.input}
                outlineColor="#cbd5e1"
                activeOutlineColor="#3b82f6"
              />
              {showToPicker && (
                <DateTimePicker
                  value={dateTo || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowToPicker(Platform.OS === "ios");
                    if (selectedDate) setDateTo(selectedDate);
                  }}
                />
              )}

              {/* Filter Chips (show only after generating report) */}
              {showFilterChips && (
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
                  {["All", "Present", "Late", "Absent"].map((status) => (
                    <Chip
                      key={status}
                      mode={filterStatus === status ? "flat" : "outlined"}
                      style={{
                        backgroundColor: filterStatus === status ? "#3b82f6" : "#f8fafc",
                      }}
                      textStyle={{ color: filterStatus === status ? "#fff" : "#1e293b" }}
                      onPress={() => setFilterStatus(status)}
                    >
                      {status}
                    </Chip>
                  ))}
                </View>
              )}

              <Button
                mode="contained"
                style={styles.button}
                onPress={handleGenerate}
                loading={loading}
              >
                Generate Report
              </Button>
            </View>

            {/* Optional header info */}
            {header && (
              <View style={styles.infoCard}>
                <Text>Date Range: {header.fromtodate}</Text>
              </View>
            )}

            {/* Employee info */}
            {reportHead && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Employee: {reportHead.employeename}</Text>
                <Text>Code: {reportHead.employeecode}</Text>
                <Text>Department: {reportHead.departmentname}</Text>
                <Text>Designation: {reportHead.designationname}</Text>
                <Text>Joined: {reportHead.joineddate}</Text>
              </View>
            )}

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}
          </>
        }
      />
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0f2fe" },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    marginTop: 10,
    shadowRadius: 12,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center", color: "#1e293b" },
  input: { marginBottom: 20, backgroundColor: "#f8fafc", borderRadius: 10, fontSize: 16 },
  button: {
    marginTop: 10,
    borderRadius: 5,
    paddingVertical: 2,
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: { fontWeight: "700", fontSize: 16, marginBottom: 4, color: "#1e293b" },
  rowCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  rowLeft: { flex: 1 },
  rowCenter: { flex: 1, alignItems: "center" },
  rowRight: { flex: 1, alignItems: "flex-end" },
  rowDate: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  rowWeek: { fontSize: 14, color: "#64748b" },
  statusChip: { height: 28, justifyContent: "center" },
  lateText: { fontSize: 12, color: "#f97316", marginTop: 4 },
  rowText: { fontSize: 14, color: "#334155", marginTop: 4 },
});