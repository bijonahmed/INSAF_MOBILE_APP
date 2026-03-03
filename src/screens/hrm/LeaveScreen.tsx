import React, { useEffect, useState } from 'react';
import {View,Text, StyleSheet} from 'react-native';

//import { get } from '../../config/apiHelper';
//import { API_ENDPOINTS } from '../../config/apiRoutes';

/* ================= COMPONENT ================= */
const LeaveScreen = () => {
  /* ================= UI ================= */
  return (
     <View style={styles.container}>
    <Text style={styles.title}>We are working on</Text>
  </View>
  );
};

export default LeaveScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
 title: {
  flex: 1,
  textAlign: 'center',
  textAlignVertical: 'center',
  fontSize: 22,
  fontWeight: 'bold',
  color: '#1e293b',
},
});