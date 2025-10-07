"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  LogOut, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock,
  BarChart3,
  Award,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAttendanceRecords } from "@/lib/storage"
import type { AttendanceRecord } from "@/lib/types"
import { AttendanceChart } from "@/components/attendance-chart"
import { useToast } from "@/hooks/use-toast"

function StudentDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadRecords()
  }, [user])

  const loadRecords = () => {
    const allRecords = getAttendanceRecords()
    const studentRecords = allRecords.filter((r) => r.studentId === user?.studentId)
    setRecords(studentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const calculateStats = () => {
    const total = records.length
    const present = records.filter((r) => r.status === "present").length
    const absent = records.filter((r) => r.status === "absent").length
    const late = records.filter((r) => r.status === "late").length
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : "0"

    return { total, present, absent, late, attendanceRate }
  }

  const getAttendanceStatus = () => {
    const rate = parseFloat(calculateStats().attendanceRate)
    if (rate >= 90) return { text: "Excellent", color: "text-green-600", icon: Award }
    if (rate >= 75) return { text: "Good", color: "text-blue-600", icon: CheckCircle2 }
    if (rate >= 60) return { text: "Average", color: "text-yellow-600", icon: AlertCircle }
    return { text: "Needs Improvement", color: "text-red-600", icon: XCircle }
  }

  const downloadReport = (format: "excel" | "pdf") => {
    if (records.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance records found",
        variant: "destructive",
      })
      return
    }

    if (format === "excel") {
      const headers = ["Date", "Subject", "Status", "Marked By", "Notes"]
      const rows = records.map((r) => [r.date, r.subject || "", r.status, r.markedBy, r.notes || ""])

      const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `my-attendance-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Excel report downloaded successfully",
      })
    } else {
      const stats = calculateStats()
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>My Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; }
            .header { margin-bottom: 30px; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .present { color: green; }
            .absent { color: red; }
            .late { color: orange; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <p><strong>Student:</strong> ${user?.name}</p>
            <p><strong>Student ID:</strong> ${user?.studentId}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>Total Classes</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.total}</p>
            </div>
            <div class="stat-card">
              <h3>Present</h3>
              <p style="font-size: 24px; font-weight: bold; color: green;">${stats.present}</p>
            </div>
            <div class="stat-card">
              <h3>Absent</h3>
              <p style="font-size: 24px; font-weight: bold; color: red;">${stats.absent}</p>
            </div>
            <div class="stat-card">
              <h3>Late</h3>
              <p style="font-size: 24px; font-weight: bold; color: orange;">${stats.late}</p>
            </div>
            <div class="stat-card">
              <h3>Attendance Rate</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.attendanceRate}%</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Marked By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (r) => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.subject || "-"}</td>
                  <td class="${r.status}">${r.status.toUpperCase()}</td>
                  <td>${r.markedBy}</td>
                  <td>${r.notes || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `

      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.print()
      }

      toast({
        title: "Success",
        description: "PDF report opened in new window",
      })
    }
  }

  const stats = calculateStats()
  const status = getAttendanceStatus()
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-2xl shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold">{user?.name}</span> • {user?.studentId}
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
        {/* Performance Banner */}
        {records.length > 0 && (
          <Card className="mb-6 border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <StatusIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{stats.attendanceRate}% Attendance Rate</h3>
                    <p className="text-green-50">Performance Status: {status.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-50">Total Classes Attended</p>
                  <p className="text-3xl font-bold">{stats.present}/{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-md border-0">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="records" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Records</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">All sessions</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-50">Present</CardTitle>
                    <CheckCircle2 className="w-5 h-5 text-green-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.present}</p>
                  <p className="text-xs text-green-100 mt-1">
                    {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-red-50">Absent</CardTitle>
                    <XCircle className="w-5 h-5 text-red-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.absent}</p>
                  <p className="text-xs text-red-100 mt-1">
                    {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(0) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-yellow-50">Late</CardTitle>
                    <Clock className="w-5 h-5 text-yellow-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.late}</p>
                  <p className="text-xs text-yellow-100 mt-1">
                    {stats.total > 0 ? ((stats.late / stats.total) * 100).toFixed(0) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-50">Rate</CardTitle>
                    <TrendingUp className="w-5 h-5 text-blue-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.attendanceRate}%</p>
                  <p className={`text-xs text-blue-100 mt-1 font-medium`}>
                    {status.text}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Attendance Trends</CardTitle>
                    <CardDescription>Visual representation of your attendance over time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AttendanceChart records={records} />
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Recent Attendance</CardTitle>
                      <CardDescription>Your latest 10 attendance records</CardDescription>
                    </div>
                  </div>
                  {records.length > 10 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("records")}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No attendance records yet</p>
                    <p className="text-sm text-gray-400">Your attendance history will appear here</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Marked By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.slice(0, 10).map((record, index) => (
                          <TableRow key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <TableCell className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell>{record.subject || "-"}</TableCell>
                            <TableCell>
                              {record.status === "present" && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Present
                                </Badge>
                              )}
                              {record.status === "absent" && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Absent
                                </Badge>
                              )}
                              {record.status === "late" && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Late
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">{record.markedBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">All Attendance Records</CardTitle>
                    <CardDescription>Complete history of your attendance ({records.length} records)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No attendance records yet</p>
                    <p className="text-sm text-gray-400">Your attendance history will appear here</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Marked By</TableHead>
                          <TableHead className="font-semibold">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record, index) => (
                          <TableRow key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <TableCell className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell>{record.subject || "-"}</TableCell>
                            <TableCell>
                              {record.status === "present" && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Present
                                </Badge>
                              )}
                              {record.status === "absent" && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Absent
                                </Badge>
                              )}
                              {record.status === "late" && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Late
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">{record.markedBy}</TableCell>
                            <TableCell className="max-w-xs truncate text-gray-600">{record.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">{stats.present}</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-600">{stats.absent}</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Late</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-600">{stats.late}</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600">{stats.attendanceRate}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Download Section */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Download Reports</CardTitle>
                    <CardDescription>Export your attendance data in Excel or PDF format</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => downloadReport("excel")}
                    className="h-14 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all text-base font-semibold"
                    disabled={records.length === 0}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Excel Report
                  </Button>
                  <Button 
                    onClick={() => downloadReport("pdf")}
                    variant="outline"
                    className="h-14 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 transition-all text-base font-semibold"
                    disabled={records.length === 0}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Report
                  </Button>
                </div>
                {records.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No records available to download
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  )
}
