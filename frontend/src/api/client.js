import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Toggle mock mode — set to false when backend is ready
export const MOCK = false

// WebSocket URL
export const WS_URL = 'ws://localhost:8000/ws/simulation'

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message)
    return Promise.reject(error)
  }
)
