import { createContext, useContext, useState, ReactNode } from 'react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser({ id: data.data.id, email: data.data.email, name: data.data.username })
        return true
      } else {
        console.error(data.message)
        return false
      }
    } catch (err) {
      console.error('Signup Error:', err)
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
        return true
      } else {
        console.error(data.message)
        return false
      }
    } catch (err) {
      console.error('Login Error:', err)
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
    } catch (err) {
      console.error('Logout Error:', err)
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
