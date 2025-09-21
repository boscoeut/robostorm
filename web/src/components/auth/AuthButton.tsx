import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoginForm } from './LoginForm'
import { LogOut, Shield, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AuthButtonProps {
  variant?: 'default' | 'mobile'
}

export const AuthButton: React.FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const { user, isAdmin, signOut, loading } = useAuth()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginForm(false)
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col space-y-3 w-full">
          {/* User Info */}
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 w-full">
            {/* Profile Image */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`${user.user_metadata?.avatar_url ? 'hidden' : ''}`}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <span className="truncate">{user.email}</span>
                {isAdmin && (
                  <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
          {/* Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {/* Profile Image */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`${user.user_metadata?.avatar_url ? 'hidden' : ''}`}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{user.email}</span>
            {isAdmin && (
              <Shield className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLoginForm(true)}
      >
        Sign In
      </Button>

      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600"
              onClick={() => setShowLoginForm(false)}
              aria-label="Close sign in dialog"
            >
              <X className="h-4 w-4" />
            </Button>
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onCancel={() => setShowLoginForm(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
