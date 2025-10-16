'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { apiService } from '@/services/apiService'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  LightBulbIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface AIInsight {
  insight: string
  category: 'improvement' | 'motivation' | 'pattern' | 'recommendation' | 'achievement'
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

interface HabitRecommendation {
  name: string
  description: string
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function InsightsView() {
  const { user, habits, entries, insights, setInsights } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<HabitRecommendation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | AIInsight['category']>('all')

  useEffect(() => {
    if (user) {
      loadInsights()
    }
  }, [user])

  const loadInsights = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Try to load insights from API
      try {
        const [insightsData, recommendationsData] = await Promise.all([
          apiService.getUserInsights(user.user_id),
          apiService.getHabitRecommendations(user.user_id)
        ])
        
        setInsights(insightsData)
        setRecommendations(recommendationsData)
      } catch (error) {
        console.warn('API not available, generating local insights')
        generateLocalInsights()
      }
    } catch (error) {
      console.error('Error loading insights:', error)
      toast.error('Failed to load insights')
    } finally {
      setIsLoading(false)
    }
  }

  const generateLocalInsights = () => {
    const localInsights: AIInsight[] = []
    const localRecommendations: HabitRecommendation[] = []

    // Analyze user data to generate insights
    const totalHabits = habits.length
    const totalEntries = entries.filter(entry => entry.completed).length
    const recentEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp || '')
      const daysDiff = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 && entry.completed
    }).length

    // Generate insights based on data
    if (totalHabits === 0) {
      localInsights.push({
        insight: "Welcome to your habit journey! Starting with 2-3 simple habits is more effective than trying to change everything at once.",
        category: 'recommendation',
        confidence: 95,
        priority: 'high'
      })
      
      localRecommendations.push(
        {
          name: 'Morning Hydration',
          description: 'Drink a glass of water when you wake up',
          reason: 'Easy to implement and provides immediate health benefits',
          difficulty: 'easy'
        },
        {
          name: '5-Minute Meditation',
          description: 'Practice mindfulness for 5 minutes daily',
          reason: 'Builds mental clarity and is achievable for beginners',
          difficulty: 'easy'
        },
        {
          name: 'Evening Gratitude',
          description: 'Write down 3 things you\'re grateful for each evening',
          reason: 'Improves mental well-being and takes minimal time',
          difficulty: 'easy'
        }
      )
    } else {
      // User has habits - analyze patterns
      if (recentEntries === 0) {
        localInsights.push({
          insight: "It looks like you haven't tracked any habits this week. Remember, consistency is key to building lasting habits!",
          category: 'motivation',
          confidence: 90,
          priority: 'high'
        })
      } else if (recentEntries >= totalHabits * 5) {
        localInsights.push({
          insight: "Excellent work! You've been very consistent this week. This kind of dedication builds lasting change.",
          category: 'achievement',
          confidence: 95,
          priority: 'high'
        })
      }

      // Analyze habit completion patterns
      const completionRate = totalEntries > 0 ? (recentEntries / (totalHabits * 7)) * 100 : 0
      
      if (completionRate < 30) {
        localInsights.push({
          insight: "Your completion rate is low. Try focusing on just one habit at a time to build momentum.",
          category: 'improvement',
          confidence: 85,
          priority: 'high'
        })
      } else if (completionRate > 80) {
        localInsights.push({
          insight: "You're crushing it! Consider adding a new challenging habit to keep growing.",
          category: 'recommendation',
          confidence: 90,
          priority: 'medium'
        })
      }

      // Pattern analysis
      const habitFrequency: Record<string, number> = {}
      entries.forEach(entry => {
        if (entry.completed) {
          habitFrequency[entry.habit_name] = (habitFrequency[entry.habit_name] || 0) + 1
        }
      })

      const mostConsistent = Object.entries(habitFrequency)
        .sort(([,a], [,b]) => b - a)[0]

      if (mostConsistent) {
        localInsights.push({
          insight: `"${mostConsistent[0]}" is your most consistent habit with ${mostConsistent[1]} completions. Great job!`,
          category: 'pattern',
          confidence: 88,
          priority: 'medium'
        })
      }

      // Time-based recommendations
      const currentHour = new Date().getHours()
      if (currentHour >= 6 && currentHour <= 10) {
        localRecommendations.push({
          name: 'Morning Exercise',
          description: '15-20 minutes of physical activity',
          reason: 'Morning workouts boost energy and mood throughout the day',
          difficulty: 'medium'
        })
      }
      
      localRecommendations.push(
        {
          name: 'Daily Reading',
          description: 'Read for 15 minutes before bed',
          reason: 'Improves knowledge and helps with better sleep',
          difficulty: 'easy'
        },
        {
          name: 'Meal Prep Sunday',
          description: 'Prepare healthy meals for the week',
          reason: 'Saves time and promotes healthier eating habits',
          difficulty: 'medium'
        }
      )
    }

    // General motivational insights
    localInsights.push({
      insight: "Small daily improvements lead to stunning yearly results. Focus on being 1% better each day!",
      category: 'motivation',
      confidence: 100,
      priority: 'low'
    })

    setInsights(localInsights)
    setRecommendations(localRecommendations)
  }

  const refreshInsights = () => {
    loadInsights()
    toast.success('Insights refreshed!')
  }

  const getCategoryIcon = (category: AIInsight['category']) => {
    switch (category) {
      case 'improvement':
        return <TrendingUpIcon className="h-5 w-5" />
      case 'motivation':
        return <FireIcon className="h-5 w-5" />
      case 'pattern':
        return <ClockIcon className="h-5 w-5" />
      case 'recommendation':
        return <LightBulbIcon className="h-5 w-5" />
      case 'achievement':
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return <SparklesIcon className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: AIInsight['category']) => {
    switch (category) {
      case 'improvement':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'motivation':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'pattern':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'recommendation':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'achievement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: HabitRecommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'hard':
        return 'text-red-600 bg-red-100'
    }
  }

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Analyzing your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <SparklesIcon className="h-8 w-8 mr-3 text-yellow-300" />
          AI-Powered Insights
        </h1>
        <p className="text-white/80">Personalized recommendations to optimize your habit journey</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'improvement', 'motivation', 'pattern', 'recommendation', 'achievement'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshInsights}
          className="btn-secondary flex items-center"
          disabled={isLoading}
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <div className="space-y-4">
          {filteredInsights.map((insight, index) => (
            <div
              key={index}
              className={`card transition-all duration-200 hover:shadow-xl border-l-4 ${getCategoryColor(insight.category)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${getCategoryColor(insight.category)}`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {insight.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(insight.priority)}`}>
                        {insight.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{insight.insight}</p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>Confidence: {insight.confidence}%</span>
                      <div className="ml-3 flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white/95 backdrop-blur-sm text-center py-12">
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No insights available</h3>
          <p className="text-gray-600 mb-6">
            Keep tracking your habits to unlock personalized insights!
          </p>
          <button onClick={refreshInsights} className="btn-primary">
            Generate Insights
          </button>
        </div>
      )}

      {/* Habit Recommendations */}
      {recommendations.length > 0 && (
        <div className="card bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Recommended Habits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-3">{rec.description}</p>
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Why this habit:</strong> {rec.reason}
                  </p>
                </div>
                <button className="w-full btn-secondary text-sm py-2">
                  Add This Habit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Tips */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="bg-purple-100 rounded-lg p-3">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">💡 Pro Tips for Better Habits</h3>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Stack new habits onto existing routines (habit stacking)</li>
              <li>• Start with 2-minute versions of bigger habits</li>
              <li>• Focus on consistency over perfection</li>
              <li>• Celebrate small wins to build momentum</li>
              <li>• Track your habits daily for better accountability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Empty State for New Users */}
      {habits.length === 0 && insights.length === 0 && (
        <div className="card bg-white/95 backdrop-blur-sm text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Habit Journey</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create some habits and start tracking to unlock personalized AI insights that will help you build lasting routines.
          </p>
          <div className="space-y-3">
            <button className="btn-primary">
              Create Your First Habit
            </button>
            <p className="text-sm text-gray-500">
              Our AI will analyze your progress and provide personalized recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
