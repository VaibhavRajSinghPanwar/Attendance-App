"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AttendanceRecord } from "@/lib/types"

interface AttendanceChartProps {
  records: AttendanceRecord[]
}

export function AttendanceChart({ records }: AttendanceChartProps) {
  // Prepare data for pie chart
  const pieData = [
    {
      name: "Present",
      value: records.filter((r) => r.status === "present").length,
      fill: "#22c55e",
    },
    {
      name: "Absent",
      value: records.filter((r) => r.status === "absent").length,
      fill: "#ef4444",
    },
    {
      name: "Late",
      value: records.filter((r) => r.status === "late").length,
      fill: "#eab308",
    },
  ]

  // Prepare data for bar chart (last 7 days)
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split("T")[0])
    }
    return days
  }

  const last7Days = getLast7Days()
  const barData = last7Days.map((date) => {
    const dayRecords = records.filter((r) => r.date === date)
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Present: dayRecords.filter((r) => r.status === "present").length,
      Absent: dayRecords.filter((r) => r.status === "absent").length,
      Late: dayRecords.filter((r) => r.status === "late").length,
    }
  })

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
          <CardDescription>Overall attendance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days</CardTitle>
          <CardDescription>Recent attendance trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#22c55e" />
              <Bar dataKey="Absent" fill="#ef4444" />
              <Bar dataKey="Late" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
