"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  UserPlus
} from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both student name and ID",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate student ID
    if (students.some(s => s.studentId === newStudentId.trim())) {
      toast({
        title: "Duplicate Student",
        description: "A student with this ID already exists",
        variant: "destructive",
      })
      return
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      studentId: newStudentId.trim(),
      status: "present",
    }

    setStudents([...students, newStudent])
    setNewStudentName("")
    setNewStudentId("")
    
    toast({
      title: "Student Added",
      description: `${newStudent.name} has been added to the list`,
    })
  }

  const removeStudent = (id: string) => {
    const student = students.find(s => s.id === id)
    setStudents(students.filter((s) => s.id !== id))
    
    if (student) {
      toast({
        title: "Student Removed",
        description: `${student.name} has been removed from the list`,
      })
    }
  }

  const updateStudentStatus = (id: string, status: "present" | "absent" | "late") => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const handleBulkStatusChange = (status: "present" | "absent" | "late") => {
    setStudents(students.map(s => ({ ...s, status })))
    toast({
      title: "Bulk Update Applied",
      description: `All students marked as ${status}`,
    })
  }

  const handleSubmit = async () => {
    if (students.length === 0) {
      toast({
        title: "No Students Added",
        description: "Please add at least one student before saving",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      students.forEach((student) => {
        const record: AttendanceRecord = {
          id: `${Date.now()}-${student.id}`,
          studentId: student.studentId,
          studentName: student.name,
          date,
          status: student.status,
          markedBy: teacherName,
          markedAt: new Date().toISOString(),
          subject: subject.trim(),
          notes: notes.trim(),
        }
        saveAttendanceRecord(record)
      })

      toast({
        title: "Attendance Saved Successfully",
        description: `Attendance marked for ${students.length} student(s) in ${subject}`,
      })

      // Reset form
      setStudents([])
      setSubject("")
      setNotes("")
      setSearchQuery("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const presentCount = students.filter((s) => s.status === "present").length
  const absentCount = students.filter((s) => s.status === "absent").length
  const lateCount = students.filter((s) => s.status === "late").length

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Session Details Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Session Details</CardTitle>
              <CardDescription>Configure class information and date</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Subject / Class Name *
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Physics Lab"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Class Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this class session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Students Card */}
      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Add Students</CardTitle>
              <CardDescription>Enter student details to mark their attendance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="studentName" className="text-sm font-semibold text-gray-700">
                Student Name
              </Label>
              <Input
                id="studentName"
                placeholder="John Doe"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addStudent()}
                className="h-11 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700">
                Student ID
              </Label>
              <Input
                id="studentId"
                placeholder="S12345"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addStudent()}
                className="h-11 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={addStudent}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="space-y-4">
              {/* Stats and Bulk Actions */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white border-2 border-gray-300 text-gray-700 px-3 py-1.5">
                    <Users className="w-4 h-4 mr-1" />
                    Total: {students.length}
                  </Badge>
                  <Badge className="bg-green-100 border-2 border-green-300 text-green-700 px-3 py-1.5 hover:bg-green-100">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Present: {presentCount}
                  </Badge>
                  <Badge className="bg-red-100 border-2 border-red-300 text-red-700 px-3 py-1.5 hover:bg-red-100">
                    <XCircle className="w-4 h-4 mr-1" />
                    Absent: {absentCount}
                  </Badge>
                  <Badge className="bg-yellow-100 border-2 border-yellow-300 text-yellow-700 px-3 py-1.5 hover:bg-yellow-100">
                    <Clock className="w-4 h-4 mr-1" />
                    Late: {lateCount}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange("present")}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange("absent")}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    All Absent
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              {students.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search students by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 border-gray-200"
                  />
                </div>
              )}

              {/* Students Cards */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <Card key={student.id} className="border-gray-200 hover:shadow-md transition-all hover:border-blue-300">
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {/* Student Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                              <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                            </div>
                          </div>

                          {/* Status Selector */}
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select
                              value={student.status}
                              onValueChange={(value: any) => updateStudentStatus(student.id, value)}
                            >
                              <SelectTrigger className={`w-full md:w-40 h-10 border-2 ${
                                student.status === "present" 
                                  ? "border-green-300 bg-green-50 text-green-700" 
                                  : student.status === "absent"
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-yellow-300 bg-yellow-50 text-yellow-700"
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span>Present</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="absent">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span>Absent</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="late">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <span>Late</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Remove Button */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeStudent(student.id)}
                              className="hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Submit Button */}
              <Card className="border-2 border-blue-200 bg-blue-50/50 mt-6">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">Ready to Submit?</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Marking attendance for {students.length} student(s) on {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || !subject.trim()}
                      className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-base font-semibold shadow-lg disabled:opacity-50"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving Attendance...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Attendance
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {students.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No students added yet</p>
              <p className="text-sm text-gray-500">Enter student details above to start marking attendance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
