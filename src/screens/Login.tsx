import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { API_ENDPOINTS } from "../config/apiRoutes";
import { post, saveToken } from '../config/apiHelper';
import LogoImage from '../../assets/img/logo.jpg'; // local logo

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [userpassword, setUserpassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modern Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const handleLogin = async () => {
    if (!username.trim() || !userpassword.trim()) {
      showAlert('Username and Password are required');
      return;
    }

    try {
      setLoading(true);

      const res = await post(
        API_ENDPOINTS.LOGIN,
        {
          username: username.trim(),
          password: userpassword.trim(),
        },
        {} as any
      );

      //console.log('LOGIN RESPONSE:', res);
      if (res?.success && res?.data?.token) {
        await saveToken(res.data.token);
        if (res.data.user) {
          await AsyncStorage.setItem(
            'user_info',
            JSON.stringify(res.data.user)
          );
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' as never }],
        });

        return;
      }

      showAlert(res?.message || 'Invalid username or password');

    } catch (err: any) {
      console.log('LOGIN ERROR:', err);
      showAlert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.screen}>
        <View style={styles.card}>
          <Image
            source={LogoImage}
            style={styles.logo}
            resizeMode="contain"
          />

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

          {loading ? (
            // eslint-disable-next-line react-native/no-inline-styles
            <ActivityIndicator style={{ marginTop: 10 }} />
          ) : (
            <Button
              mode="contained"
              buttonColor="rgb(222, 38, 40)"
              textColor="#ffffff"
              onPress={handleLogin}
              style={styles.button}
            >
              Login
            </Button>
          )}
        </View>

        {/* Modern Custom Alert Modal */}
        <Modal
          transparent
          visible={alertVisible}
          animationType="fade"
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Login Error</Text>
              <Text style={styles.modalMessage}>{alertMessage}</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    elevation: 0,
  },

  logo: {
    width: 270,
    height: 80,
    alignSelf: 'center',
    marginBottom: 25,
  },

  input: {
    marginBottom: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
  },

  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 6,
  },

  /* ===== Modern Alert Styles ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgb(222, 38, 40)',
    marginBottom: 10,
  },

  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },

  modalButton: {
    backgroundColor: 'rgb(222, 38, 40)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },

  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});