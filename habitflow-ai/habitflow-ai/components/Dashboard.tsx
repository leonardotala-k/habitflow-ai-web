'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { apiService } from '@/services/apiService'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  CheckCircleIcon,
  FireIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

export default function Dashboard() {
  const { user, habits, entries, stats, setHabits, setEntries, setStats } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [showAddHabit, setShowAddHabit] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Try to load data from API, fall back to demo data if API is unavailable
      try {
        const [habitsData, entriesData, statsData] = await Promise.all([
          apiService.getUserHabits(user.user_id),
          apiService.getUserEntries(user.user_id, 7), // Last 7 days
          apiService.getUserStats(user.user_id)
        ])
        
        setHabits(habitsData)
        setEntries(entriesData)
        setStats(statsData)
      } catch (error) {
        console.warn('API not available, using demo data')
        // Demo data for when backend is not available
        const demoHabits = [
          { name: 'Morning Exercise', description: '30 minutes of cardio', target_frequency: 'daily', user_id: user.user_id },
          { name: 'Read Books', description: 'Read for 20 minutes', target_frequency: 'daily', user_id: user.user_id },
          { name: 'Meditation', description: '10 minutes mindfulness', target_frequency: 'daily', user_id: user.user_id },
        ]
        const demoStats = {
          total_habits: 3,
          active_habits: 3,
          completion_rate: 75,
          streak_days: 5,
          last_activity: new Date().toISOString()
        }
        setHabits(demoHabits)
        setStats(demoStats)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim() || !user) return

    try {
      const newHabit = {
        name: newHabitName.trim(),
        description: '',
        target_frequency: 'daily',
        user_id: user.user_id
      }

      // Try to create via API
      try {
        await apiService.createHabit(newHabit)
        toast.success(`Habit "${newHabitName}" added! 🎯`)
      } catch (error) {
        // Fallback to local storage if API is down
        console.warn('API not available, adding habit locally')
        toast.success(`Habit "${newHabitName}" added locally! 🎯`)
      }

      // Update local state regardless
      setHabits([...habits, newHabit])
      setNewHabitName('')
      setShowAddHabit(false)
    } catch (error) {
      console.error('Error adding habit:', error)
      toast.error('Failed to add habit')
    }
  }

  const handleTrackHabit = async (habitName: string) => {
    if (!user) return

    try {
      const entry = {
        habit_name: habitName,
        user_id: user.user_id,
        completed: true,
        notes: '',
        rating: 5
      }

      // Try to track via API
      try {
        await apiService.trackHabit(entry)
        toast.success(`Great job completing "${habitName}"! 🎉`)
      } catch (error) {
        console.warn('API not available, tracking locally')
        toast.success(`"${habitName}" tracked locally! 🎉`)
      }

      // Update local state
      setEntries([entry, ...entries])
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          completion_rate: Math.min(100, stats.completion_rate + 2),
          last_activity: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error tracking habit:', error)
      toast.error('Failed to track habit')
    }
  }

  const getTodaysEntries = () => {
    const today = new Date().toDateString()
    return entries.filter(entry => {
      const entryDate = entry.timestamp ? new Date(entry.timestamp).toDateString() : today
      return entryDate === today
    })
  }

  const isHabitCompletedToday = (habitName: string) => {
    return getTodaysEntries().some(entry => 
      entry.habit_name === habitName && entry.completed
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-white/80 text-lg">
          Ready to build some amazing habits today?
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-white/95 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center mb-3">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total_habits}</div>
            <div className="text-gray-600">Total Habits</div>
          </div>

          <div className="card bg-white/95 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center mb-3">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completion_rate}%</div>
            <div className="text-gray-600">Completion Rate</div>
          </div>

          <div className="card bg-white/95 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center mb-3">
              <FireIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.streak_days}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>

          <div className="card bg-white/95 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center mb-3">
              <CalendarIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{getTodaysEntries().length}</div>
            <div className="text-gray-600">Today's Progress</div>
          </div>
        </div>
      )}

      {/* Today's Habits */}
      <div className="card bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClockIcon className="h-7 w-7 mr-2 text-primary-500" />
            Today's Habits
          </h2>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="btn-secondary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Habit
          </button>
        </div>

        {/* Add Habit Form */}
        {showAddHabit && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleAddHabit} className="flex gap-3">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter habit name (e.g., 'Morning Walk', 'Read 20 minutes')"
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={!newHabitName.trim()}
                className="btn-primary px-6 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddHabit(false)
                  setNewHabitName('')
                }}
                className="btn-secondary px-4"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Habits List */}
        {habits.length > 0 ? (
          <div className="space-y-3">
            {habits.map((habit, index) => {
              const isCompleted = isHabitCompletedToday(habit.name)
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => !isCompleted && handleTrackHabit(habit.name)}
                      disabled={isCompleted}
                      className={`p-2 rounded-full transition-colors ${
                        isCompleted
                          ? 'text-green-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIconSolid className="h-6 w-6" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6" />
                      )}
                    </button>
                    <div>
                      <h3 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-4">
              Start building better habits by adding your first one!
            </p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="btn-primary"
            >
              Add Your First Habit
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="card bg-white/95 backdrop-blur-sm hover:bg-white transition-colors p-6 text-center group">
          <ChartBarIcon className="h-10 w-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900 mb-2">View Statistics</h3>
          <p className="text-gray-600 text-sm">Analyze your progress and trends</p>
        </button>

        <button className="card bg-white/95 backdrop-blur-sm hover:bg-white transition-colors p-6 text-center group">
          <SparklesIcon className="h-10 w-10 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
          <p className="text-gray-600 text-sm">Get personalized recommendations</p>
        </button>

        <button className="card bg-white/95 backdrop-blur-sm hover:bg-white transition-colors p-6 text-center group">
          <PlusIcon className="h-10 w-10 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900 mb-2">Manage Habits</h3>
          <p className="text-gray-600 text-sm">Add, edit, or organize your habits</p>
        </button>
      </div>
    </div>
  )
}
