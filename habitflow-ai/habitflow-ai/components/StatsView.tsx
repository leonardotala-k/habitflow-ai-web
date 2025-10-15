'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { apiService } from '@/services/apiService'
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline'
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns'

interface CompletionData {
  date: string
  completed: number
  total: number
  percentage: number
}

interface HabitStatsData {
  name: string
  totalEntries: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  lastCompleted: string | null
}

export default function StatsView() {
  const { user, habits, entries, stats } = useUserStore()
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(7)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadStatsData()
    }
  }, [user, selectedPeriod])

  const loadStatsData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Try to load fresh data from API
      await apiService.getUserStats(user.user_id)
    } catch (error) {
      console.warn('Could not load stats from API, using local data')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate completion data for the selected period
  const getCompletionData = (): CompletionData[] => {
    const data: CompletionData[] = []
    const totalHabits = habits.length

    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      const dayEntries = entries.filter(entry => {
        const entryDate = entry.timestamp ? format(new Date(entry.timestamp), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        return entryDate === dateStr && entry.completed
      })

      const completed = dayEntries.length
      const percentage = totalHabits > 0 ? (completed / totalHabits) * 100 : 0

      data.push({
        date: dateStr,
        completed,
        total: totalHabits,
        percentage: Math.round(percentage)
      })
    }

    return data
  }

  // Calculate individual habit statistics
  const getHabitStats = (): HabitStatsData[] => {
    return habits.map(habit => {
      const habitEntries = entries.filter(entry => 
        entry.habit_name === habit.name && entry.completed
      ).sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())

      const totalEntries = habitEntries.length
      const daysWithHabit = Math.max(1, Math.ceil(
        (new Date().getTime() - new Date(habit.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      ))
      
      const completionRate = (totalEntries / daysWithHabit) * 100

      // Calculate current streak
      let currentStreak = 0
      let checkDate = new Date()
      
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        const hasEntry = habitEntries.some(entry => 
          format(new Date(entry.timestamp || ''), 'yyyy-MM-dd') === dateStr
        )
        
        if (hasEntry) {
          currentStreak++
          checkDate = subDays(checkDate, 1)
        } else {
          break
        }
      }

      // Calculate longest streak (simplified)
      let longestStreak = currentStreak // For now, just use current streak

      return {
        name: habit.name,
        totalEntries,
        completionRate: Math.round(Math.min(100, completionRate)),
        currentStreak,
        longestStreak,
        lastCompleted: habitEntries.length > 0 ? habitEntries[0].timestamp || null : null
      }
    })
  }

  const completionData = getCompletionData()
  const habitStats = getHabitStats()

  // Calculate overall stats
  const totalCompletions = entries.filter(entry => entry.completed).length
  const averageCompletionRate = completionData.length > 0 
    ? Math.round(completionData.reduce((sum, day) => sum + day.percentage, 0) / completionData.length)
    : 0

  const bestStreak = Math.max(0, ...habitStats.map(stat => stat.currentStreak))
  const mostConsistentHabit = habitStats.reduce((best, current) => 
    current.completionRate > best.completionRate ? current : best
  , { name: 'None', completionRate: 0 })

  const formatRelativeDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-2">Your Progress Statistics</h1>
        <p className="text-white/80">Track your journey and celebrate your wins</p>
      </div>

      {/* Period Selection */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
          {[7, 30, 90].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as 7 | 30 | 90)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {period} days
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white/95 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center mb-3">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalCompletions}</div>
          <div className="text-gray-600">Total Completions</div>
        </div>

        <div className="card bg-white/95 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center mb-3">
            <TrendingUpIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{averageCompletionRate}%</div>
          <div className="text-gray-600">Average Rate</div>
        </div>

        <div className="card bg-white/95 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center mb-3">
            <FireIcon className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{bestStreak}</div>
          <div className="text-gray-600">Best Streak</div>
        </div>

        <div className="card bg-white/95 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center mb-3">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{habits.length}</div>
          <div className="text-gray-600">Active Habits</div>
        </div>
      </div>

      {/* Completion Chart */}
      <div className="card bg-white/95 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
          Daily Completion Rate
        </h2>
        <div className="space-y-3">
          {completionData.map((day, index) => (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600">
                {index === completionData.length - 1 ? 'Today' : 
                 index === completionData.length - 2 ? 'Yesterday' : 
                 format(new Date(day.date), 'MMM d')}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${day.percentage}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-gray-900">
                {day.completed}/{day.total}
              </div>
              <div className="w-12 text-sm text-gray-600">
                {day.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Performance */}
      {habitStats.length > 0 && (
        <div className="card bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Habit Performance
          </h2>
          <div className="space-y-4">
            {habitStats.map((stat) => (
              <div key={stat.name} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{stat.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stat.completionRate >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : stat.completionRate >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.completionRate}% completion
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                    <span>{stat.totalEntries} completions</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FireIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span>{stat.currentStreak} day streak</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrophyIcon className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>{stat.longestStreak} best streak</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Last: {formatRelativeDate(stat.lastCompleted)}</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stat.completionRate >= 80 
                        ? 'bg-green-500' 
                        : stat.completionRate >= 60 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card bg-white/95 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUpIcon className="h-6 w-6 mr-2 text-purple-500" />
          Quick Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">🏆 Most Consistent</h3>
            <p className="text-green-700">
              {mostConsistentHabit.name !== 'None' 
                ? `${mostConsistentHabit.name} with ${mostConsistentHabit.completionRate}% completion rate`
                : 'Start tracking habits to see insights'
              }
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📈 Progress Trend</h3>
            <p className="text-blue-700">
              {averageCompletionRate >= 70 
                ? `Great job! You're maintaining a ${averageCompletionRate}% completion rate`
                : averageCompletionRate >= 50 
                  ? `Good progress at ${averageCompletionRate}%. Keep building momentum!`
                  : 'Focus on consistency. Small steps lead to big changes!'
              }
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">🔥 Streak Power</h3>
            <p className="text-orange-700">
              {bestStreak > 0 
                ? `Your best streak is ${bestStreak} days. Can you beat it?`
                : 'Complete habits consistently to build powerful streaks!'
              }
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">🎯 Next Goal</h3>
            <p className="text-purple-700">
              {habits.length === 0 
                ? 'Create your first habit to get started'
                : totalCompletions < 10 
                  ? 'Reach 10 total completions'
                  : `Maintain ${Math.min(100, averageCompletionRate + 10)}% completion rate`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="card bg-white/95 backdrop-blur-sm text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No data to show yet</h3>
          <p className="text-gray-600 mb-6">
            Create some habits and start tracking to see your progress statistics!
          </p>
        </div>
      )}
    </div>
  )
}
