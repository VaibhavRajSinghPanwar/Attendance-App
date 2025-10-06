"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Edit2, Trash2, Search } from "lucide-react"
import { getAttendanceRecords, updateAttendanceRecord, deleteAttendanceRecord } from "@/lib/storage"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AttendanceHistoryProps {
  teacherId: string
}

export function AttendanceHistory({ teacherId }: AttendanceHistoryProps) {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "late">("all")
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [editStatus, setEditStatus] = useState<"present" | "absent" | "late">("present")

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchTerm, dateFilter, statusFilter])

  const loadRecords = () => {
    const allRecords = getAttendanceRecords()
    setRecords(allRecords)
  }

  const filterRecords = () => {
    let filtered = [...records]

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (dateFilter) {
      filtered = filtered.filter((r) => r.date === dateFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    setFilteredRecords(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setEditStatus(record.status)
  }

  const handleSaveEdit = () => {
    if (editingRecord) {
      updateAttendanceRecord(editingRecord.id, { status: editStatus })
      loadRecords()
      setEditingRecord(null)
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      deleteAttendanceRecord(id)
      loadRecords()
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View, edit, and manage attendance records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Student name, ID, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Date</Label>
              <Input id="dateFilter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger id="statusFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{record.studentName}</TableCell>
                      <TableCell>{record.studentId}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Update the attendance status for this record</DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Student: {editingRecord.studentName}</p>
                <p className="text-sm text-muted-foreground">ID: {editingRecord.studentId}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(editingRecord.date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
