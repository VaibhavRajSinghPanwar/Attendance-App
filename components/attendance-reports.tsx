"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileSpreadsheet, FileText } from "lucide-react"
import { getAttendanceRecords } from "@/lib/storage"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AttendanceReportsProps {
  teacherId: string
}

export function AttendanceReports({ teacherId }: AttendanceReportsProps) {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const allRecords = getAttendanceRecords()
    setRecords(allRecords)
  }, [])

  const getFilteredRecords = () => {
    let filtered = [...records]

    if (startDate) {
      filtered = filtered.filter((r) => r.date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter((r) => r.date <= endDate)
    }

    return filtered
  }

  const calculateStats = () => {
    const filtered = getFilteredRecords()
    const total = filtered.length
    const present = filtered.filter((r) => r.status === "present").length
    const absent = filtered.filter((r) => r.status === "absent").length
    const late = filtered.filter((r) => r.status === "late").length

    return {
      total,
      present,
      absent,
      late,
      presentPercentage: total > 0 ? ((present / total) * 100).toFixed(1) : "0",
    }
  }

  const downloadExcel = () => {
    const filtered = getFilteredRecords()

    if (filtered.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance records found for the selected date range",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["Date", "Student Name", "Student ID", "Subject", "Status", "Marked By", "Notes"]
    const rows = filtered.map((r) => [
      r.date,
      r.studentName,
      r.studentId,
      r.subject || "",
      r.status,
      r.markedBy,
      r.notes || "",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Excel report downloaded successfully",
    })
  }

  const downloadPDF = () => {
    const filtered = getFilteredRecords()

    if (filtered.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance records found for the selected date range",
        variant: "destructive",
      })
      return
    }

    // Create a simple HTML report
    const stats = calculateStats()
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; }
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
        <h1>Attendance Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${startDate ? `<p>From: ${startDate}</p>` : ""}
        ${endDate ? `<p>To: ${endDate}</p>` : ""}
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total Records</h3>
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
            <p style="font-size: 24px; font-weight: bold;">${stats.presentPercentage}%</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (r) => `
              <tr>
                <td>${r.date}</td>
                <td>${r.studentName}</td>
                <td>${r.studentId}</td>
                <td>${r.subject || "-"}</td>
                <td class="${r.status}">${r.status.toUpperCase()}</td>
                <td>${r.markedBy}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    // Open in new window for printing
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

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Statistics</CardTitle>
          <CardDescription>Overview of attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
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
                <p className="text-3xl font-bold">{stats.presentPercentage}%</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Download Reports</CardTitle>
          <CardDescription>Export attendance data in Excel or PDF format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={downloadExcel} className="flex-1">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="flex-1 bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
