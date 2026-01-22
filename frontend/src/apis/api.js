import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Connects to the backend on local server
});

// This adds the token to every request if any exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

export default API;