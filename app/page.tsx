"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen } from "lucide-react"
import { initializeDefaultAccounts } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    initializeDefaultAccounts()

    // Redirect if already logged in
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <BookOpen className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">Attendance Management System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Streamline attendance tracking for educational institutions with our modern, intuitive platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Users className="w-10 h-10" />
                </div>
              </div>
              <CardTitle className="text-2xl">Teacher Portal</CardTitle>
              <CardDescription className="text-base">
                Mark attendance, generate reports, and manage student records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => router.push("/auth/login?role=teacher")}>
                Teacher Login
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
                onClick={() => router.push("/auth/register?role=teacher")}
              >
                Register as Teacher
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <GraduationCap className="w-10 h-10" />
                </div>
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription className="text-base">
                View your attendance records, track progress, and download reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => router.push("/auth/login?role=student")}>
                Student Login
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
                onClick={() => router.push("/auth/register?role=student")}
              >
                Register as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-2">HOD Access</p>
          <Button variant="link" onClick={() => router.push("/auth/login?role=hod")}>
            HOD Login
          </Button>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Demo Credentials: HOD - hod@school.edu / hod123</p>
        </div>
      </div>
    </div>
  )
}
