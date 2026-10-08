// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const leaderId = useAuthStore.getState().loggedLeaderId;
  if (leaderId) {
    config.headers['X-User-Id'] = leaderId;
  }
  return config;
});