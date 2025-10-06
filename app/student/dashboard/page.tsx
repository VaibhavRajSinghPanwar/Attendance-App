"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Calendar, TrendingUp, FileText, Download } from "lucide-react"
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
    // Filter records for current student
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
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.name} ({user?.studentId})
              </p>
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
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Records
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.attendanceRate}%</p>
                </CardContent>
              </Card>
            </div>

            <AttendanceChart records={records} />

            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your latest attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No attendance records yet</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Marked By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.subject || "-"}</TableCell>
                            <TableCell>
                              {record.status === "present" && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Present
                                </Badge>
                              )}
                              {record.status === "absent" && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Absent
                                </Badge>
                              )}
                              {record.status === "late" && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Late
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{record.markedBy}</TableCell>
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
            <Card>
              <CardHeader>
                <CardTitle>All Attendance Records</CardTitle>
                <CardDescription>Complete history of your attendance</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No attendance records yet</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.subject || "-"}</TableCell>
                            <TableCell>
                              {record.status === "present" && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Present
                                </Badge>
                              )}
                              {record.status === "absent" && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Absent
                                </Badge>
                              )}
                              {record.status === "late" && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Late
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{record.markedBy}</TableCell>
                            <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Download Reports</CardTitle>
                <CardDescription>Export your attendance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.attendanceRate}%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => downloadReport("excel")} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                  <Button onClick={() => downloadReport("pdf")} variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
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
