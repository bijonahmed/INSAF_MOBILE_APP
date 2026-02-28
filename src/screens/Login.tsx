import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
//import { API_URL } from '../config/config'; // adjust path
import { post } from '../config/apiHelper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

//const API_URL_LOGIN = `${post}/v2/SecUsers/Login`;

const Login = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [userpassword, setUserpassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLogin = async () => {
    setError('');

    if (!username.trim() || !userpassword.trim()) {
      setError('Username and Password are required');
      return;
    }

    try {
      setLoading(true);

      // ✅ Use safe post helper
      const data = await post('v2/SecUsers/Login', {
        username: username.trim(),
        userpassword: userpassword.trim(),
      });

      console.log('LOGIN RESPONSE:', data);

      if (data?.data?.token) {
        await AsyncStorage.setItem('access_token', data.data.token);

        if (data.data.user) {
          await AsyncStorage.setItem(
            'user_info',
            JSON.stringify(data.data.user),
          );
        }

        navigation.replace('Dashboard');
        return;
      }

      setError(data?.message || 'Invalid username or password');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={userpassword}
          onChangeText={setUserpassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 10 }} />
        ) : (
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>
        )}
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 18,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#0f172a',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
  },
  error: {
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
});
