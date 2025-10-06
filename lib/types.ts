export type UserRole = "teacher" | "student" | "hod"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  approved?: boolean
  department?: string
  studentId?: string
  teacherId?: string
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  date: string
  status: "present" | "absent" | "late"
  markedBy: string
  markedAt: string
  subject?: string
  notes?: string
}

export interface PendingApproval {
  id: string
  userId: string
  email: string
  name: string
  department: string
  teacherId: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
}
