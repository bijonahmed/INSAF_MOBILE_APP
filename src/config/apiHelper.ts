import { API_URL } from './config';
//POST request helper
export const post = async (endpoint: string, body: any, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  // eslint-disable-next-line dot-notation
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.warn('Failed to parse JSON:', text);
    return {};
  }
};

// GET request helper
export const get = async (endpoint: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  // eslint-disable-next-line dot-notation
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'GET',
    headers,
  });

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.warn('Failed to parse JSON:', text);
    return {};
  }
};