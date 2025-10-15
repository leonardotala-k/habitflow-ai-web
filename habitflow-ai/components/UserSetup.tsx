'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { apiService } from '@/services/apiService'
import toast from 'react-hot-toast'
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function UserSetup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Generate a unique user ID for web users
      const user_id = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const userData = {
        ...formData,
        user_id,
      }

      // Try to create user in the backend
      try {
        await apiService.createUser(userData)
        toast.success('Welcome to HabitFlow AI! 🎉')
      } catch (error) {
        // If backend is not available, just proceed with local user
        console.warn('Backend not available, using local user')
        toast.success('Welcome to HabitFlow AI! (Demo Mode) 🎉')
      }

      // Set user in store regardless of backend status
      setUser(userData)
      
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <SparklesIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to HabitFlow AI
          </h1>
          <p className="text-white/80 text-lg">
            Your personal AI-powered habit tracker
          </p>
        </div>

        <div className="card bg-white/95 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <UserIcon className="h-8 w-8 text-primary-500 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Let's get started
              </h2>
              <p className="text-gray-600">
                Tell us a bit about yourself
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
                placeholder="johndoe"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.first_name}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                'Start Your Journey 🚀'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              * Required fields. Your data is stored securely and never shared.
            </p>
          </form>
        </div>

        <div className="mt-8 text-center text-white/60 text-sm">
          <p>Already used HabitFlow AI before?</p>
          <button 
            onClick={() => {
              // Simple demo user for testing
              const demoUser = {
                user_id: 'demo_user',
                first_name: 'Demo',
                last_name: 'User',
                username: 'demo',
                email: 'demo@habitflow.ai'
              }
              setUser(demoUser)
              toast.success('Welcome back, Demo User! 👋')
            }}
            className="text-white/80 hover:text-white underline mt-1"
          >
            Try Demo Mode
          </button>
        </div>
      </div>
    </div>
  )
}

