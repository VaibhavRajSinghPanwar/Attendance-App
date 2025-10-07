"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Shield, CheckCircle2, TrendingUp } from "lucide-react"
import { initializeDefaultAccounts } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    initializeDefaultAccounts()

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

  const features = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      text: "Real-time attendance tracking"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "Comprehensive analytics & reports"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Secure & reliable data management"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-14 h-14" />
            </div>
          </div>
          
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Attendance Management System
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline attendance tracking for educational institutions with our modern, intuitive platform designed for excellence
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="text-blue-600">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Teacher Portal Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-2 group">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex justify-center mb-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Users className="w-12 h-12" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">Teacher Portal</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Mark attendance, generate comprehensive reports, and manage student records efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-8 pb-8">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all" 
                size="lg" 
                onClick={() => router.push("/auth/login?role=teacher")}
              >
                Teacher Login
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                size="lg"
                onClick={() => router.push("/auth/register?role=teacher")}
              >
                Register as Teacher
              </Button>
            </CardContent>
          </Card>

          {/* Student Portal Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-2 group">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex justify-center mb-5">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <GraduationCap className="w-12 h-12" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">Student Portal</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                View your attendance records, track your progress, and download detailed reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-8 pb-8">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all" 
                size="lg" 
                onClick={() => router.push("/auth/login?role=student")}
              >
                Student Login
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
                size="lg"
                onClick={() => router.push("/auth/register?role=student")}
              >
                Register as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* HOD Access Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Administrative Access</p>
            </div>
            <Button 
              variant="link" 
              className="text-lg font-medium text-purple-600 hover:text-purple-700 transition-colors"
              onClick={() => router.push("/auth/login?role=hod")}
            >
              HOD Login →
            </Button>
          </div>
        </div>

        {/* Demo Credentials Footer */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 max-w-2xl mx-auto shadow-md">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Demo Credentials:</span> HOD - hod@school.edu / hod123
          </p>
        </div>
      </div>

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
        .animate-blob {
          animation: blob 7s infinite;
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
