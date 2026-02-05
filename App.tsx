import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';

enableScreens(); // important

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <PaperProvider>
      {/* Full-screen status bar */}
        <StatusBar hidden={true} />

      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
