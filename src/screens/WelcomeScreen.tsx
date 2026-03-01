import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import LogoImage from '../../assets/img/logo.jpg'; // local logo

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width } = Dimensions.get('window');

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


//   import { API_ENDPOINTS } from "../config/apiRoutes";
// import { get } from "../config/apiHelper";

// const fetchEmployees = async (token: string) => {
//   try {
//     const response = await get(API_ENDPOINTS.EMPLOYMENT.GET_EMPLOYEE_LIST, token);
//     console.log(response.data);
//   } catch (err) {
//     console.error(err);
//   }
// };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Hospital Logo */}
        <Image source={LogoImage} style={styles.logo} resizeMode="contain" />

        {/* Static Welcome Text */}
        {/* <Text style={styles.welcomeText}>
          Welcome to our INSAF BARAKAH KIDNEY & GENERAL HOSPITAL
        </Text> */}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, { width: width * 0.6 }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Footer with dynamic year */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {currentYear} Insaf Barakah Hospital
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 250,
    height: 80,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: 36,
    lineHeight: 28,
  },
  button: {
    backgroundColor: 'rgb(222, 38, 40)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});