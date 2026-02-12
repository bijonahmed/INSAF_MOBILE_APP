import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput } from "react-native-paper";

const ReportsScreen = () => {
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");

  const handleGenerate = () => {
    console.log({
      department,
      designation,
      dateFrom,
      dateTo,
      status,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>HR Reports Filter</Text>

          <TextInput
            label="Department"
            mode="outlined"
            value={department}
            onChangeText={setDepartment}
            style={styles.input}
          />

          <TextInput
            label="Designation"
            mode="outlined"
            value={designation}
            onChangeText={setDesignation}
            style={styles.input}
          />

          <TextInput
            label="Date From (YYYY-MM-DD)"
            mode="outlined"
            value={dateFrom}
            onChangeText={setDateFrom}
            style={styles.input}
          />

          <TextInput
            label="Date To (YYYY-MM-DD)"
            mode="outlined"
            value={dateTo}
            onChangeText={setDateTo}
            style={styles.input}
          />

          <TextInput
            label="Status (Active / Inactive)"
            mode="outlined"
            value={status}
            onChangeText={setStatus}
            style={styles.input}
          />

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleGenerate}
          >
            Generate Report
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  scroll: {
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 18,

    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0f172a",
    textAlign: "center",
  },

  input: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },

  button: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 6,
  },
});
