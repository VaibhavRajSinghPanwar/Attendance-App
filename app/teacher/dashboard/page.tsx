"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, ClipboardList, FileText, UserPlus } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="mark" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mark">
            <MarkAttendance teacherId={user?.id || ""} teacherName={user?.name || ""} />
          </TabsContent>

          <TabsContent value="history">
            <AttendanceHistory teacherId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="reports">
            <AttendanceReports teacherId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>
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
