'use client'

import { useUserStore } from '@/store/userStore'
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  SparklesIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid'

interface NavigationProps {
  currentView: 'dashboard' | 'habits' | 'stats' | 'insights'
  onViewChange: (view: 'dashboard' | 'habits' | 'stats' | 'insights') => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, clearUser } = useUserStore()

  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      key: 'habits',
      label: 'My Habits',
      icon: CogIcon,
      activeIcon: CogIconSolid,
    },
    {
      key: 'stats',
      label: 'Statistics',
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
    },
    {
      key: 'insights',
      label: 'AI Insights',
      icon: SparklesIcon,
      activeIcon: SparklesIconSolid,
    },
  ] as const

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <SparklesIcon className="h-8 w-8 text-white mr-2" />
              <span className="text-white font-bold text-xl">HabitFlow AI</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = currentView === item.key
                const Icon = isActive ? item.activeIcon : item.icon
                return (
                  <button
                    key={item.key}
                    onClick={() => onViewChange(item.key)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-white/90">
              <UserCircleIcon className="h-6 w-6 mr-2" />
              <span className="hidden sm:block">
                Hi, {user?.first_name || 'User'}!
              </span>
            </div>
            <button
              onClick={() => {
                clearUser()
              }}
              className="text-white/70 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = currentView === item.key
              const Icon = isActive ? item.activeIcon : item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => onViewChange(item.key)}
                  className={`
                    flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 min-w-0 flex-1
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

