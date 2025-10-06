"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save } from "lucide-react"
import { saveAttendanceRecord } from "@/lib/storage"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
  studentId: string
  status: "present" | "absent" | "late"
}

interface MarkAttendanceProps {
  teacherId: string
  teacherName: string
}

export function MarkAttendance({ teacherId, teacherName }: MarkAttendanceProps) {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [subject, setSubject] = useState("")
  const [notes, setNotes] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentId, setNewStudentId] = useState("")

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter both student name and ID",
        variant: "destructive",
      })
      return
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName,
      studentId: newStudentId,
      status: "present",
    }

    setStudents([...students, newStudent])
    setNewStudentName("")
    setNewStudentId("")
  }

  const removeStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id))
  }

  const updateStudentStatus = (id: string, status: "present" | "absent" | "late") => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const handleSubmit = () => {
    if (students.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one student",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject",
        variant: "destructive",
      })
      return
    }

    students.forEach((student) => {
      const record: AttendanceRecord = {
        id: `${Date.now()}-${student.id}`,
        studentId: student.studentId,
        studentName: student.name,
        date,
        status: student.status,
        markedBy: teacherName,
        markedAt: new Date().toISOString(),
        subject,
        notes,
      }
      saveAttendanceRecord(record)
    })

    toast({
      title: "Success",
      description: `Attendance marked for ${students.length} student(s)`,
    })

    // Reset form
    setStudents([])
    setSubject("")
    setNotes("")
  }

  const presentCount = students.filter((s) => s.status === "present").length
  const absentCount = students.filter((s) => s.status === "absent").length
  const lateCount = students.filter((s) => s.status === "late").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Record student attendance for today's class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this class..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Students</CardTitle>
          <CardDescription>Add students to mark their attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                placeholder="John Doe"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addStudent()}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="S12345"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addStudent()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addStudent}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {students.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Present: {presentCount}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Absent: {absentCount}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Late: {lateCount}
                </Badge>
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <Select
                      value={student.status}
                      onValueChange={(value: any) => updateStudentStatus(student.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeStudent(student.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
