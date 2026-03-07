import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/Login';
import DashboardScreen from '../screens/DashboardScreen';
import EmployeeScreen from '../screens/hrm/EmployeeScreen';
import RosterScreen from '../screens/hrm/RosterScreen';
import ReportsScreen from '../screens/hrm/ReportsScreen';
import LockScreen from '../screens/hrm/LockScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import AttendanceScreen from '../screens/hrm/report/AttendanceScreen';
import AddLeave from '../screens/hrm/leave/AddLeave';
import LeaveScreen from '../screens/hrm/leave/LeaveScreen';
import LeaveHistory from '../screens/hrm/leave/LeaveHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerBackVisible: false }}
      />

      {/* HRM Screens */}
      <Stack.Screen name="Employee" component={EmployeeScreen} />
      <Stack.Screen name="Roster" component={RosterScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="LockScreen" component={LockScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="AddLeave" component={AddLeave} />
      <Stack.Screen name="LeaveHistory" component={LeaveHistory} />
    </Stack.Navigator>
  );
}
