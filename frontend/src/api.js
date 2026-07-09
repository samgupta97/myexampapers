import axios from 'axios';

var API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Interceptor to attach the auth token to every request if it exists in local storage
API.interceptors.request.use(function (config) {
  var token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

// =============================================
// AUTHENTICATION APIs
// =============================================

export function signup(data) {
  return API.post('/auth/signup', data);
}

export function sendOtp(email) {
  return API.post('/auth/send-otp', { email: email });
}

export function verifyOtp(email, otp) {
  return API.post('/auth/verify-otp', { email: email, otp: otp });
}

export function adminLogin(email, password) {
  return API.post('/admin/login', { email: email, password: password });
}

// =============================================
// EXAM PAPERS APIs
// =============================================

export function getPapers(statusAll) {
  return API.get('/papers' + (statusAll ? '?status=all' : ''));
}

export function getPaper(id) {
  return API.get('/papers/' + id);
}

export function createPaper(formData) {
  return API.post('/papers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function updatePaper(id, formData) {
  return API.put('/papers/' + id, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function deletePaper(id) {
  return API.delete('/papers/' + id);
}

// =============================================
// USER MANAGEMENT APIs (Admin Only)
// =============================================

export function getUsers() {
  return API.get('/users');
}

export function getUser(id) {
  return API.get('/users/' + id);
}

export function createUser(data) {
  return API.post('/users', data);
}

export function updateUser(id, data) {
  return API.put('/users/' + id, data);
}

export function deleteUser(id) {
  return API.delete('/users/' + id);
}
