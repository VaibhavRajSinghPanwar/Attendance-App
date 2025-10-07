"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Briefcase,
  XCircle,
  Hash,
  Shield,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, user } = useAuth()
  const role = (searchParams.get("role") || "student") as "teacher" | "student"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    teacherId: "",
    studentId: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    if (user && !success) {
      if (user.role === "teacher") {
        router.push("/teacher/dashboard")
      } else if (user.role === "student") {
        router.push("/student/dashboard")
      }
    }
  }, [user, router, success])

  // Password strength calculator
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0
      if (formData.password.length >= 6) strength++
      if (formData.password.length >= 10) strength++
      if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++
      if (/\d/.test(formData.password)) strength++
      if (/[^a-zA-Z0-9]/.test(formData.password)) strength++
      setPasswordStrength(strength)
    }
    calculateStrength()
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role,
      department: formData.department,
      teacherId: formData.teacherId,
      studentId: formData.studentId,
    })

    setIsLoading(false)

    if (result.success) {
      if (role === "teacher") {
        setSuccess(result.error || "Registration successful! Awaiting HOD approval.")
      }
    } else {
      setError(result.error || "Registration failed")
    }
  }

  // Role-based styling
  const getRoleConfig = () => {
    if (role === "teacher") {
      return {
        icon: <Users className="w-6 h-6" />,
        gradient: "from-blue-500 to-blue-600",
        textColor: "text-blue-600",
        bgColor: "bg-blue-500"
      }
    }
    return {
      icon: <GraduationCap className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-600",
      textColor: "text-green-600",
      bgColor: "bg-green-500"
    }
  }

  const roleConfig = getRoleConfig()

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-3xl shadow-xl animate-bounce-slow">
                <CheckCircle2 className="w-16 h-16" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-800">Registration Successful!</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed px-4">
                {success}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            {role === "teacher" && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Your account will be reviewed by the HOD. You'll receive access once approved.
                </AlertDescription>
              </Alert>
            )}
            <Button 
              className={`w-full h-12 bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 shadow-md text-base font-semibold`}
              onClick={() => router.push(`/auth/login?role=${role}`)}
            >
              Go to Login
            </Button>
            <Button 
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>

        <style jsx>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
        `}</style>
      </div>
    )
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
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
              {role === "teacher" ? "Teacher" : "Student"} Registration
            </CardTitle>
            <CardDescription className="text-base text-gray-600 leading-relaxed px-4">
              {role === "teacher"
                ? "Register as a teacher. Your account will require HOD approval before activation."
                : "Create your student account to start tracking your attendance records"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* Teacher-specific fields */}
            {role === "teacher" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                    Department
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="department"
                      placeholder="Computer Science"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherId" className="text-sm font-semibold text-gray-700">
                    Teacher ID
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="teacherId"
                      placeholder="T12345"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Student-specific field */}
            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700">
                  Student ID
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="studentId"
                    placeholder="S12345"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="pl-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: <span className="font-semibold">{getPasswordStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* HOD Approval Notice for Teachers */}
            {role === "teacher" && (
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Teacher accounts require HOD approval before activation.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full h-12 bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 shadow-md hover:shadow-lg transition-all text-base font-semibold`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <span className="text-gray-600">Already have an account? </span>
              <Link 
                href={`/auth/login?role=${role}`} 
                className={`${roleConfig.textColor} hover:underline font-semibold transition-colors`}
              >
                Login here
              </Link>
            </div>
          </form>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
