'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { apiService } from '@/services/apiService'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface HabitFormData {
  name: string
  description: string
  target_frequency: string
}

export default function HabitsView() {
  const { user, habits, entries, setHabits, addEntry } = useUserStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    target_frequency: 'daily'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && habits.length === 0) {
      loadHabits()
    }
  }, [user])

  const loadHabits = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const habitsData = await apiService.getUserHabits(user.user_id)
      setHabits(habitsData)
    } catch (error) {
      console.warn('Could not load habits from API, using local data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !user) return

    try {
      const habitData = {
        ...formData,
        name: formData.name.trim(),
        user_id: user.user_id
      }

      if (editingHabit) {
        // Update existing habit (local update for now)
        const updatedHabits = habits.map(habit => 
          habit.name === editingHabit ? { ...habit, ...habitData } : habit
        )
        setHabits(updatedHabits)
        toast.success('Habit updated! 📝')
        setEditingHabit(null)
      } else {
        // Create new habit
        try {
          await apiService.createHabit(habitData)
          toast.success(`Habit "${formData.name}" created! 🎯`)
        } catch (error) {
          console.warn('API not available, adding habit locally')
          toast.success(`Habit "${formData.name}" added locally! 🎯`)
        }
        setHabits([...habits, habitData])
      }

      // Reset form
      setFormData({ name: '', description: '', target_frequency: 'daily' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error saving habit:', error)
      toast.error('Failed to save habit')
    }
  }

  const handleEdit = (habit: any) => {
    setFormData({
      name: habit.name,
      description: habit.description || '',
      target_frequency: habit.target_frequency
    })
    setEditingHabit(habit.name)
    setShowAddForm(true)
  }

  const handleDelete = async (habitName: string) => {
    if (!confirm(`Are you sure you want to delete "${habitName}"?`)) return

    try {
      // Remove from local state
      const updatedHabits = habits.filter(habit => habit.name !== habitName)
      setHabits(updatedHabits)
      toast.success('Habit deleted')
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast.error('Failed to delete habit')
    }
  }

  const handleTrackHabit = async (habitName: string, rating: number = 5) => {
    if (!user) return

    try {
      const entry = {
        habit_name: habitName,
        user_id: user.user_id,
        completed: true,
        notes: '',
        rating,
        timestamp: new Date().toISOString()
      }

      try {
        await apiService.trackHabit(entry)
        toast.success(`Great job completing "${habitName}"! 🎉`)
      } catch (error) {
        console.warn('API not available, tracking locally')
        toast.success(`"${habitName}" tracked locally! 🎉`)
      }

      addEntry(entry)
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

  const getHabitStreak = (habitName: string) => {
    // Simple streak calculation - count consecutive days with entries
    const habitEntries = entries
      .filter(entry => entry.habit_name === habitName && entry.completed)
      .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())
    
    let streak = 0
    let currentDate = new Date()
    
    for (const entry of habitEntries) {
      const entryDate = new Date(entry.timestamp || '')
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
        currentDate = new Date(entryDate.getTime() - 24 * 60 * 60 * 1000) // Move back one day
      } else {
        break
      }
    }
    
    return streak
  }

  const cancelEdit = () => {
    setEditingHabit(null)
    setShowAddForm(false)
    setFormData({ name: '', description: '', target_frequency: 'daily' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Habits</h1>
          <p className="text-white/80">Manage and track your daily habits</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {editingHabit ? 'Cancel Edit' : 'Add Habit'}
        </button>
      </div>

      {/* Add/Edit Habit Form */}
      {showAddForm && (
        <div className="card bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingHabit ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Exercise, Read 20 minutes"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description or notes about this habit"
                className="input-field min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Frequency
              </label>
              <select
                value={formData.target_frequency}
                onChange={(e) => setFormData({ ...formData, target_frequency: e.target.value })}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="3_times_week">3 times per week</option>
                <option value="weekdays">Weekdays only</option>
                <option value="weekends">Weekends only</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map((habit, index) => {
            const isCompleted = isHabitCompletedToday(habit.name)
            const streak = getHabitStreak(habit.name)
            
            return (
              <div
                key={index}
                className={`card transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-50/95 border-green-200'
                    : 'bg-white/95 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => !isCompleted && handleTrackHabit(habit.name)}
                      disabled={isCompleted}
                      className={`p-3 rounded-full transition-all ${
                        isCompleted
                          ? 'text-green-600 bg-green-100 cursor-not-allowed'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIconSolid className="h-7 w-7" />
                      ) : (
                        <CheckCircleIcon className="h-7 w-7" />
                      )}
                    </button>

                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        isCompleted ? 'text-green-800' : 'text-gray-900'
                      }`}>
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-gray-600 mt-1">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {habit.target_frequency.replace('_', ' ')}
                        </span>
                        {streak > 0 && (
                          <span className="text-sm text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded-full">
                            🔥 {streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>

                    <button
                      onClick={() => handleEdit(habit)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit habit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(habit.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete habit"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Rating for completed habits */}
                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">
                        How did it go today?
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleTrackHabit(habit.name, rating)}
                            className="p-1 text-yellow-400 hover:text-yellow-500 transition-colors"
                          >
                            <StarIcon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card bg-white/95 backdrop-blur-sm text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building better habits by creating your first one. Small steps lead to big changes!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Create Your First Habit
          </button>
        </div>
      )}

      {/* Today's Progress Summary */}
      {habits.length > 0 && (
        <div className="card bg-white/95 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-blue-500" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
              <div className="text-blue-800 text-sm font-medium">Total Habits</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getTodaysEntries().length}</div>
              <div className="text-green-800 text-sm font-medium">Completed Today</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {habits.length > 0 ? Math.round((getTodaysEntries().length / habits.length) * 100) : 0}%
              </div>
              <div className="text-orange-800 text-sm font-medium">Completion Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
