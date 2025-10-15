import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface User {
  user_id: string
  username?: string
  first_name: string
  last_name?: string
  email?: string
}

export interface Habit {
  name: string
  description?: string
  target_frequency: string
  user_id: string
}

export interface HabitEntry {
  habit_name: string
  user_id: string
  completed: boolean
  notes?: string
  rating?: number
}

export interface UserStats {
  total_habits: number
  active_habits: number
  completion_rate: number
  streak_days: number
  last_activity: string
}

export interface AIInsight {
  insight: string
  category: string
  confidence: number
}

export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  },

  // User endpoints
  async createUser(user: User) {
    const response = await api.post('/users', user)
    return response.data
  },

  // Habit endpoints
  async createHabit(habit: Habit) {
    const response = await api.post('/habits', habit)
    return response.data
  },

  async getUserHabits(userId: string) {
    const response = await api.get(`/habits/${userId}`)
    return response.data
  },

  async trackHabit(entry: HabitEntry) {
    const response = await api.post('/habits/track', entry)
    return response.data
  },

  // Stats and insights
  async getUserStats(userId: string): Promise<UserStats> {
    const response = await api.get(`/stats/${userId}`)
    return response.data
  },

  async getUserEntries(userId: string, days: number = 30) {
    const response = await api.get(`/entries/${userId}?days=${days}`)
    return response.data
  },

  async getUserInsights(userId: string): Promise<AIInsight[]> {
    const response = await api.get(`/insights/${userId}`)
    return response.data
  },

  async getHabitRecommendations(userId: string) {
    const response = await api.get(`/recommendations/${userId}`)
    return response.data
  },

  // Dashboard data (combined endpoint)
  async getDashboardData(userId: string) {
    const response = await api.get(`/dashboard/${userId}`)
    return response.data
  },
}

export default apiService

