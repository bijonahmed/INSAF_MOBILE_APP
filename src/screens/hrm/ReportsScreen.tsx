import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ReportsScreen = () => {
  return (
    <View style={styles.container}>
      {/* <Header title="Reports" /> */}
      <View style={styles.content}>
        <Text>Reports page</Text>
      </View>
      {/* <Footer /> */}
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});