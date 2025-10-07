"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Mail, Lock, GraduationCap, Users, Shield, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const role = searchParams.get("role") || "student"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      if (user.role === "teacher") {
        router.push("/teacher/dashboard")
      } else if (user.role === "student") {
        router.push("/student/dashboard")
      } else if (user.role === "hod") {
        router.push("/hod/dashboard")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
      setIsLoading(false)
    }
  }

  const handleOAuthSimulation = () => {
    setError("")
    alert("OAuth simulation: In a real application, this would redirect to Google/Microsoft login")
  }

  // Role-based styling
  const getRoleConfig = () => {
    switch (role) {
      case "teacher":
        return {
          icon: <Users className="w-6 h-6" />,
          gradient: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-500",
          textColor: "text-blue-600",
          hoverColor: "hover:bg-blue-50"
        }
      case "hod":
        return {
          icon: <Shield className="w-6 h-6" />,
          gradient: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-500",
          textColor: "text-purple-600",
          hoverColor: "hover:bg-purple-50"
        }
      default:
        return {
          icon: <GraduationCap className="w-6 h-6" />,
          gradient: "from-green-500 to-emerald-600",
          bgColor: "bg-green-500",
          textColor: "text-green-600",
          hoverColor: "hover:bg-green-50"
        }
    }
  }

  const roleConfig = getRoleConfig()
  const roleName = role === "teacher" ? "Teacher" : role === "hod" ? "HOD" : "Student"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 pb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit -ml-2 hover:bg-gray-100 transition-colors" 
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Role icon with gradient background */}
          <div className="flex justify-center">
            <div className={`bg-gradient-to-br ${roleConfig.gradient} text-white p-4 rounded-2xl shadow-lg`}>
              {roleConfig.icon}
            </div>
          </div>

          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-800">
              {roleName} Login
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter your credentials to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 animate-shake">
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                href="#" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full h-12 bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 shadow-md hover:shadow-lg transition-all text-base font-semibold`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* OAuth Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-base font-medium" 
              onClick={handleOAuthSimulation}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC04"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google (Demo)
            </Button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <span className="text-gray-600">Don't have an account? </span>
              <Link 
                href={`/auth/register?role=${role}`} 
                className={`${roleConfig.textColor} hover:underline font-semibold transition-colors`}
              >
                Register here
              </Link>
            </div>
          </form>

          {/* Quick Demo Info */}
          {role === "hod" && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800 text-center">
                <span className="font-semibold">Demo:</span> hod@school.edu / hod123
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
