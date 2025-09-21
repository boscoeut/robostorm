import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { UserPreferencesService } from '@/services/database'
import { useState, useCallback } from 'react'

// Main authentication hook
export const useAuth = () => {
  return useAuthContext()
}

// Hook for user preferences
export const useUserPreferences = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserPreferences = useCallback(async () => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: prefError } = await UserPreferencesService.getByUserId(user.id)
      if (prefError) {
        setError(prefError.message)
        return null
      }
      return data
    } catch (err) {
      setError('Failed to fetch user preferences')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateUserPreferences = useCallback(async (preferences: any) => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: prefError } = await UserPreferencesService.updateByUserId(user.id, preferences)
      if (prefError) {
        setError(prefError.message)
        return null
      }
      return data
    } catch (err) {
      setError('Failed to update user preferences')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const addFavoriteVehicle = useCallback(async (vehicleId: string) => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: prefError } = await UserPreferencesService.addFavoriteVehicle(user.id, vehicleId)
      if (prefError) {
        setError(prefError.message)
        return null
      }
      return data
    } catch (err) {
      setError('Failed to add favorite vehicle')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const removeFavoriteVehicle = useCallback(async (vehicleId: string) => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: prefError } = await UserPreferencesService.removeFavoriteVehicle(user.id, vehicleId)
      if (prefError) {
        setError(prefError.message)
        return null
      }
      return data
    } catch (err) {
      setError('Failed to remove favorite vehicle')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    getUserPreferences,
    updateUserPreferences,
    addFavoriteVehicle,
    removeFavoriteVehicle,
    loading,
    error,
    clearError: () => setError(null)
  }
}

// Hook for authentication state
export const useAuthState = () => {
  const { user, session, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isGuest: !user && !loading,
    isLoading: loading,
    user,
    session
  }
}

// Hook for authentication actions
export const useAuthActions = () => {
  const { signIn, signUp, signOut, resetPassword, updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
        return false
      }
      return true
    } catch (err) {
      setError('Sign in failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [signIn])

  const handleSignUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: signUpError } = await signUp(email, password)
      if (signUpError) {
        setError(signUpError.message)
        return false
      }
      return true
    } catch (err) {
      setError('Sign up failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [signUp])

  const handleSignOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await signOut()
      return true
    } catch (err) {
      setError('Sign out failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [signOut])

  const handleResetPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: resetError } = await resetPassword(email)
      if (resetError) {
        setError(resetError.message)
        return false
      }
      return true
    } catch (err) {
      setError('Password reset failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [resetPassword])

  const handleUpdatePassword = useCallback(async (password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: updateError } = await updatePassword(password)
      if (updateError) {
        setError(updateError.message)
        return false
      }
      return true
    } catch (err) {
      setError('Password update failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [updatePassword])

  return {
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    loading,
    error,
    clearError: () => setError(null)
  }
}

// Hook for protected routes
export const useProtectedRoute = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuthState()
  
  // You can implement redirect logic here if using React Router
  // For now, we'll just return the authentication state
  
  return {
    isAuthenticated,
    isLoading,
    redirectTo
  }
}
