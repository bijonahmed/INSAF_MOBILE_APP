import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SHA256 from "crypto-js/sha256";

// Storage key
const STORAGE_KEY = "PATTERN_HASH";

// Grid size 3x3
const GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const PatternLockScreen = () => {
  const [savedPattern, setSavedPattern] = useState<string | null>(null);
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [status, setStatus] = useState("Draw your pattern");
  const [unlocked, setUnlocked] = useState(false); // lock/unlock state

  useEffect(() => {
    loadPattern();
  }, []);

  const loadPattern = async () => {
    const hash = await AsyncStorage.getItem(STORAGE_KEY);
    setSavedPattern(hash);
    if (!hash) setStatus("Set your pattern");
  };

  const handlePress = (num: number) => {
    setCurrentPattern([...currentPattern, num]);
  };

  const resetPattern = () => {
    setCurrentPattern([]);
  };

  const submitPattern = async () => {
    if (currentPattern.length < 4) {
      Alert.alert("Pattern too short", "Use at least 4 dots");
      resetPattern();
      return;
    }

    const hash = SHA256(currentPattern.join("-")).toString();

    // First time register
    if (!savedPattern) {
      await AsyncStorage.setItem(STORAGE_KEY, hash);
      setSavedPattern(hash);
      Alert.alert("✅ Pattern Set", "Now verify 3 times");
      resetPattern();
      setMatchCount(0);
      setStatus("Verify pattern");
      return;
    }

    // Verify
    if (hash === savedPattern) {
      const next = matchCount + 1;
      setMatchCount(next);
      setStatus(`Matched ${next}/3`);
      if (next === 3) {
        setUnlocked(true); // unlock screen
        setMatchCount(0);
      }
    } else {
      Alert.alert("❌ Wrong pattern", "Try again");
      setMatchCount(0);
      setStatus("Draw your pattern");
    }

    resetPattern();
  };

  // ----------------- Welcome Screen -----------------
  if (unlocked) {
    return (
      <SafeAreaView style={styles.welcomeContainer}>
        <ScrollView contentContainerStyle={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>🎉 Welcome Back! 🎉</Text>
          <Text style={styles.welcomeText}>
            This is your unlocked content screen. Here you can show anything you want:
          </Text>
          <Text style={styles.welcomeText}>• HRM Dashboard</Text>
          <Text style={styles.welcomeText}>• Employee Attendance</Text>
          <Text style={styles.welcomeText}>• Salary Details</Text>
          <Text style={styles.welcomeText}>• Notices</Text>
          <Text style={styles.welcomeText}>• Analytics</Text>
          <Text style={styles.welcomeText}>...and much more!</Text>
          <TouchableOpacity
            style={styles.lockAgainBtn}
            onPress={() => setUnlocked(false)}
          >
            <Text style={styles.lockAgainText}>Lock Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ----------------- Lock Screen -----------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{status}</Text>

      <View style={styles.grid}>
        {GRID.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.dot,
              currentPattern.includes(num) && styles.dotActive,
            ]}
            onPress={() => handlePress(num)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={submitPattern}>
        <Text style={styles.submitText}>Submit Pattern</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Attempts: {matchCount}/3</Text>
    </View>
  );
};

export default PatternLockScreen;

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, marginBottom: 20, fontWeight: "600" },
  grid: {
    width: 240,
    height: 240,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#94a3b8",
    margin: 10,
  },
  dotActive: { backgroundColor: "#2563eb" },
  submitBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footer: { marginTop: 20, fontSize: 16, color: "#475569" },

  // Welcome styles
  welcomeContainer: { flex: 1, backgroundColor: "#e0f2fe" },
  welcomeContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  welcomeTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  welcomeText: { fontSize: 20, marginBottom: 12, color: "#1e293b", textAlign: "center" },
  lockAgainBtn: { marginTop: 30, backgroundColor: "#ef4444", padding: 15, borderRadius: 8 },
  lockAgainText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
