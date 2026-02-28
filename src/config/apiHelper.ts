// src/config/apiHelper.ts
import { API_URL } from './config';

export const post = async (endpoint: string, body: any) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // ✅ safely parse JSON
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn('Failed to parse JSON:', text);
    return {};
  }
};