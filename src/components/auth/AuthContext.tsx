import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const { toast } = useToast()

  // Restore auth from cookie on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/check`, {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          // Backend does not return user payload; set minimal placeholder
          setUser(prev => prev ?? { id: 'me', email: 'session@active', name: 'User' })
          // Optional: subtle success, keep quiet to avoid noise
        } else {
          setUser(null)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setIsInitializing(false)
      }
    }
    checkAuth()
  }, [])

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        // Auto-login to set auth cookie, since signup doesn't set cookie
        const loggedIn = await login(email, password)
        if (!loggedIn) {
          // Fallback: set minimal user for immediate UX, though cookie may be missing
          setUser({ id: data.data.id, email: data.data.email, name: data.data.username })
        }
        toast({ title: 'Account created', description: 'Welcome to LingoDocs!' })
        return loggedIn || true
      } else {
        toast({ title: 'Sign up failed', description: data?.message || 'Please try again', variant: 'destructive' })
        return false
      }
    } catch (err) {
      toast({ title: 'Signup error', description: 'Something went wrong. Please try again.', variant: 'destructive' })
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important to store cookie
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        // Backend does not return user data, you can fetch profile or use token to decode later
        // For demo, set email as name placeholder
        setUser({ id: '', email, name: email.split('@')[0] })
        toast({ title: 'Signed in', description: 'Welcome back!' })
        return true
      } else {
        toast({ title: 'Sign in failed', description: data?.message || 'Invalid credentials', variant: 'destructive' })
        return false
      }
    } catch (err) {
      toast({ title: 'Login error', description: 'Something went wrong. Please try again.', variant: 'destructive' })
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`, {
        method: 'POST',
        credentials: 'include', // send cookie to backend
      })
      setUser(null)
      toast({ title: 'Signed out', description: 'You have been logged out.' })
    } catch (err) {
      toast({ title: 'Logout error', description: 'Could not log out. Please retry.', variant: 'destructive' })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
