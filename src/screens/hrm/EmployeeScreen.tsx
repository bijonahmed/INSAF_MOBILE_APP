import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

// 🔥 নিজের PC IP বসান এখানে (real device use করার জন্য)
const API_BASE = "http://192.168.0.105:8000/api";

// Form data type
type FormData = {
  name: string;
  email: string;
  department: string;
  designation: string;
};

export default function AddEmployeeScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    department: "",
    designation: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Properly typed handleChange
  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email) {
      Alert.alert("Validation Error", "Name and Email are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/addEmployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Employee added successfully!");
        setFormData({
          name: "",
          email: "",
          department: "",
          designation: "",
        });
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.log("API ERROR:", error);
      Alert.alert("Connection Error", "Cannot connect to server");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add Employee</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Department ID"
          keyboardType="numeric"
          value={formData.department}
          onChangeText={(text) => handleChange("department", text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Designation ID"
          keyboardType="numeric"
          value={formData.designation}
          onChangeText={(text) => handleChange("designation", text)}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
