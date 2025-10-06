"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: "teacher" | "student"
  department?: string
  teacherId?: string
  studentId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find((u: User & { password: string }) => u.email === email && u.password === password)

      if (!foundUser) {
        return { success: false, error: "Invalid email or password" }
      }

      if (foundUser.role === "teacher" && !foundUser.approved) {
        return { success: false, error: "Your account is pending HOD approval" }
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if user already exists
      if (users.some((u: User) => u.email === data.email)) {
        return { success: false, error: "Email already registered" }
      }

      const newUser = {
        id: Date.now().toString(),
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        department: data.department,
        teacherId: data.teacherId,
        studentId: data.studentId,
        approved: data.role === "student", // Students are auto-approved
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // If teacher, add to pending approvals
      if (data.role === "teacher") {
        const pendingApprovals = JSON.parse(localStorage.getItem("pendingApprovals") || "[]")
        pendingApprovals.push({
          id: newUser.id,
          userId: newUser.id,
          email: data.email,
          name: data.name,
          department: data.department || "",
          teacherId: data.teacherId || "",
          requestedAt: new Date().toISOString(),
          status: "pending",
        })
        localStorage.setItem("pendingApprovals", JSON.stringify(pendingApprovals))
        return { success: true, error: "Registration successful! Awaiting HOD approval." }
      }

      // Auto-login for students
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
