import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});
