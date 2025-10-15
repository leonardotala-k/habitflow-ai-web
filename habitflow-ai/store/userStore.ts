import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  user_id: string
  username?: string
  first_name: string
  last_name?: string
  email?: string
}

interface Habit {
  name: string
  description?: string
  target_frequency: string
  user_id: string
  created_at?: string
}

interface HabitEntry {
  habit_name: string
  user_id: string
  completed: boolean
  notes?: string
  rating?: number
  timestamp?: string
}

interface UserStats {
  total_habits: number
  active_habits: number
  completion_rate: number
  streak_days: number
  last_activity: string
}

interface AIInsight {
  insight: string
  category: string
  confidence: number
}

interface UserState {
  user: User | null
  habits: Habit[]
  entries: HabitEntry[]
  stats: UserStats | null
  insights: AIInsight[]
  isLoading: boolean
  
  // Actions
  setUser: (user: User) => void
  setHabits: (habits: Habit[]) => void
  setEntries: (entries: HabitEntry[]) => void
  setStats: (stats: UserStats) => void
  setInsights: (insights: AIInsight[]) => void
  setLoading: (loading: boolean) => void
  
  addHabit: (habit: Habit) => void
  addEntry: (entry: HabitEntry) => void
  
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      habits: [],
      entries: [],
      stats: null,
      insights: [],
      isLoading: false,
      
      setUser: (user) => set({ user }),
      setHabits: (habits) => set({ habits }),
      setEntries: (entries) => set({ entries }),
      setStats: (stats) => set({ stats }),
      setInsights: (insights) => set({ insights }),
      setLoading: (isLoading) => set({ isLoading }),
      
      addHabit: (habit) => set((state) => ({ 
        habits: [...state.habits, habit] 
      })),
      
      addEntry: (entry) => set((state) => ({ 
        entries: [entry, ...state.entries] 
      })),
      
      clearUser: () => set({
        user: null,
        habits: [],
        entries: [],
        stats: null,
        insights: [],
        isLoading: false
      }),
    }),
    {
      name: 'habitflow-user-storage',
    }
  )
)

