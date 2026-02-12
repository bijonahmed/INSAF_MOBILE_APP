import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";

const RoosterScreen = () => {
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const [shift, setShift] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleGenerate = () => {
    console.log({
      department,
      employee,
      shift,
      day,
      month,
      year,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Rooster Filter</Text>

          <TextInput
            label="Department"
            mode="outlined"
            value={department}
            onChangeText={setDepartment}
            style={styles.input}
          />

          <TextInput
            label="Employee Name"
            mode="outlined"
            value={employee}
            onChangeText={setEmployee}
            style={styles.input}
          />

          <TextInput
            label="Shift (Morning / Evening / Night)"
            mode="outlined"
            value={shift}
            onChangeText={setShift}
            style={styles.input}
          />

          <TextInput
            label="Day (1-31)"
            mode="outlined"
            keyboardType="numeric"
            value={day}
            onChangeText={setDay}
            style={styles.input}
          />

          <TextInput
            label="Month (1-12)"
            mode="outlined"
            keyboardType="numeric"
            value={month}
            onChangeText={setMonth}
            style={styles.input}
          />

          <TextInput
            label="Year (2026)"
            mode="outlined"
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleGenerate}
            style={styles.button}
          >
            Generate Rooster
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default RoosterScreen;

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
    padding: 24,
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
    textAlign: "center",
    color: "#0f172a",
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
