import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const Login = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'demo' && password === 'demo') {
      setError('');
      navigation.replace('Dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
        >
          Login
        </Button>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff', // ✅ Full white background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    elevation: 4, // Android shadow
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0f172a',
  },

  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },

  button: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  error: {
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
});
