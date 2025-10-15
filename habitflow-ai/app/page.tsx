'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import HabitsView from '@/components/HabitsView'
import StatsView from '@/components/StatsView'
import InsightsView from '@/components/InsightsView'
import UserSetup from '@/components/UserSetup'
import { useUserStore } from '@/store/userStore'

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'habits' | 'stats' | 'insights'>('dashboard')
  const { user, isLoading } = useUserStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading HabitFlow AI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <UserSetup />
  }

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'habits' && <HabitsView />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'insights' && <InsightsView />}
      </main>
      
      <footer className="text-center text-white/80 py-8">
        <p>HabitFlow AI - Your journey to better habits starts here 🌟</p>
      </footer>
    </div>
  )
}

