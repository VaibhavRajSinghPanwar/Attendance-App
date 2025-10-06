import type { AttendanceRecord, PendingApproval, User } from "./types"

// Initialize default HOD account
export function initializeDefaultAccounts() {
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  if (!users.some((u: User) => u.role === "hod")) {
    const hodAccount = {
      id: "hod-default",
      email: "hod@school.edu",
      password: "hod123",
      name: "Head of Department",
      role: "hod",
      approved: true,
      createdAt: new Date().toISOString(),
    }
    users.push(hodAccount)
    localStorage.setItem("users", JSON.stringify(users))
  }
}

export function getAttendanceRecords(): AttendanceRecord[] {
  return JSON.parse(localStorage.getItem("attendanceRecords") || "[]")
}

export function saveAttendanceRecord(record: AttendanceRecord) {
  const records = getAttendanceRecords()
  records.push(record)
  localStorage.setItem("attendanceRecords", JSON.stringify(records))
}

export function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>) {
  const records = getAttendanceRecords()
  const index = records.findIndex((r) => r.id === id)
  if (index !== -1) {
    records[index] = { ...records[index], ...updates }
    localStorage.setItem("attendanceRecords", JSON.stringify(records))
  }
}

export function deleteAttendanceRecord(id: string) {
  const records = getAttendanceRecords()
  const filtered = records.filter((r) => r.id !== id)
  localStorage.setItem("attendanceRecords", JSON.stringify(filtered))
}

export function getPendingApprovals(): PendingApproval[] {
  return JSON.parse(localStorage.getItem("pendingApprovals") || "[]")
}

export function approveTeacher(approvalId: string) {
  const approvals = getPendingApprovals()
  const approval = approvals.find((a) => a.id === approvalId)

  if (approval) {
    approval.status = "approved"
    localStorage.setItem("pendingApprovals", JSON.stringify(approvals))

    // Update user status
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === approval.userId)
    if (userIndex !== -1) {
      users[userIndex].approved = true
      localStorage.setItem("users", JSON.stringify(users))
    }
  }
}

export function rejectTeacher(approvalId: string) {
  const approvals = getPendingApprovals()
  const approval = approvals.find((a) => a.id === approvalId)

  if (approval) {
    approval.status = "rejected"
    localStorage.setItem("pendingApprovals", JSON.stringify(approvals))
  }
}
