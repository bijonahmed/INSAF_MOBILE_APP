import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/Login'; // ✅ FIXED

import DashboardScreen from '../screens/DashboardScreen';

import EmployeeScreen from '../screens/hrm/EmployeeScreen';
import RosterScreen from '../screens/hrm/RosterScreen';
import LeaveScreen from '../screens/hrm/LeaveScreen';
import ReportsScreen from '../screens/hrm/ReportsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerBackVisible: false }} // ✅ modern way
      />

      {/* HRM Screens */}
      <Stack.Screen name="Employee" component={EmployeeScreen} />
      <Stack.Screen name="Roster" component={RosterScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}
