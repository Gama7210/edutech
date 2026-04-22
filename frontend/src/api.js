import axios from 'axios';

const esCapacitor = typeof window !== 'undefined' && (
  window.location.protocol === 'capacitor:' ||
  (window.location.protocol === 'http:' && window.location.port === '')
);

const BACKEND = esCapacitor
  ? 'http://192.168.100.17:4001'
  : 'https://edutech-1c74.onrender.com';

axios.defaults.baseURL = BACKEND;

const token = localStorage.getItem('edu_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axios;