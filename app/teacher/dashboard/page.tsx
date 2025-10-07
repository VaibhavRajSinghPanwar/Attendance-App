"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LogOut, 
  ClipboardList, 
  FileText, 
  UserPlus, 
  Users,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BookOpen
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { MarkAttendance } from "@/components/mark-attendance"
import { AttendanceHistory } from "@/components/attendance-history"
import { AttendanceReports } from "@/components/attendance-reports"

function TeacherDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("mark")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Quick stats data (can be connected to real data later)
  const quickStats = [
    {
      title: "Today's Classes",
      value: "0",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Students Marked",
      value: "0",
      icon: Users,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Pending Reviews",
      value: "0",
      icon: ClipboardList,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Completion Rate",
      value: "0%",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Banner */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Ready to Mark Attendance?</h3>
                  <p className="text-blue-50">Manage student attendance efficiently with our streamlined system</p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab("mark")}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hidden md:flex"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Start Marking
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-md border-0">
            <TabsTrigger 
              value="mark" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Mark Attendance</span>
              <span className="sm:hidden">Mark</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Mark Attendance Tab */}
          <TabsContent value="mark" className="space-y-0">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Mark Student Attendance</CardTitle>
                    <CardDescription>Record attendance for your classes quickly and efficiently</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <MarkAttendance teacherId={user?.id || ""} teacherName={user?.name || ""} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-0">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Attendance History</CardTitle>
                    <CardDescription>View and manage previously recorded attendance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AttendanceHistory teacherId={user?.id || ""} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-0">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Attendance Reports</CardTitle>
                    <CardDescription>Generate and export comprehensive attendance reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AttendanceReports teacherId={user?.id || ""} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Footer */}
        <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Need Help?</p>
                  <p className="text-xs text-gray-500">Access tutorials and support documentation</p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                View Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

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

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherDashboardContent />
    </ProtectedRoute>
  )
}
