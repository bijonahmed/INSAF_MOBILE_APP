import React from "react";
import { View, Text, StyleSheet } from "react-native";

type HeaderProps = {
  title?: string; // optional
};

const Header = ({ title }: HeaderProps): React.ReactElement => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title || "আমার অ্যাপ.."}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Header;