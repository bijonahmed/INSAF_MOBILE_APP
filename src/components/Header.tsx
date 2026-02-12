import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Platform, BackHandler, Alert } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TopBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopBar = ({ darkMode, setDarkMode }: TopBarProps) => {
  const navigation = useNavigation<NavigationProp>();

  const handleExit = () => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'android') BackHandler.exitApp();
            else navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ExitIcon = ({ size = 24, color = '#0f172a' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 17L15 12L10 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 12H3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12C21 16.4183 16.4183 21 12 21C7.58172 21 3 16.4183 3 12C3 7.58172 7.58172 3 12 3C16.4183 3 21 7.58172 21 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#111827' : '#f8fafc' }]}>
      <Switch value={darkMode} onValueChange={setDarkMode} />
      <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
        <ExitIcon color={darkMode ? '#fff' : '#0f172a'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exitButton: {
    marginLeft: 12,
  },
});
