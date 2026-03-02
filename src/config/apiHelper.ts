/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';

//  Token Helper
const TOKEN_KEY = 'access_token';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.warn('Failed to get token');
    return null;
  }
};


export const getUserInfo = async (): Promise<any | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn('No valid token found. User is not authenticated.');
      return null;
    }

    const userStr = await AsyncStorage.getItem('user_info');
    if (userStr) {
      return JSON.parse(userStr);
    }

    return null;
  } catch (err) {
    console.warn('Failed to get user info:', err);
    return null;
  }
};

//  Check if token exists
export const hasToken = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token; // true if token exists
};


// Core Request Function
const request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any
) => {
  const token = await getAuthToken();

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  //console.log('==============================');
  //console.log(`${method} REQUEST`);
  //console.log('URL:', url);

  if (body) console.log('BODY:', body);
  //console.log('TOKEN:', token ? 'Attached' : 'No Token');
  //console.log('==============================');

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn('Failed to parse JSON:', text);
  }

  //Auto Logout on 401
  if (response.status === 401) {
    console.warn('Unauthorized - Logging out...');
    await removeToken();
    // Optional: navigate to Login screen
  }

  return data;
};

// Public Methods
export const get = (url: string) => request('GET', url);
export const post = (url: string, body: any) => request('POST', url, body);
export const put = (url: string, body: any) => request('PUT', url, body);
export const del = (url: string) => request('DELETE', url);