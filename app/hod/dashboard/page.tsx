"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, LogOut, Users, Clock, CheckCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getPendingApprovals, approveTeacher, rejectTeacher } from "@/lib/storage"
import type { PendingApproval } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

function HODDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = () => {
    const allApprovals = getPendingApprovals()
    setApprovals(allApprovals)
  }

  const handleApprove = (approvalId: string) => {
    approveTeacher(approvalId)
    loadApprovals()
    toast({
      title: "Teacher Approved",
      description: "The teacher account has been approved successfully.",
    })
  }

  const handleReject = (approvalId: string) => {
    rejectTeacher(approvalId)
    loadApprovals()
    toast({
      title: "Teacher Rejected",
      description: "The teacher registration has been rejected.",
      variant: "destructive",
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredApprovals = approvals.filter((approval) => {
    if (filter === "all") return true
    return approval.status === filter
  })

  const pendingCount = approvals.filter((a) => a.status === "pending").length
  const approvedCount = approvals.filter((a) => a.status === "approved").length
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HOD Dashboard</h1>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total rejected</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Teacher Registration Requests</CardTitle>
                <CardDescription>Review and approve teacher accounts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("approved")}
                >
                  Approved
                </Button>
                <Button
                  variant={filter === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("rejected")}
                >
                  Rejected
                </Button>
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                  All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApprovals.length === 0 ? (
              <Alert>
                <Users className="w-4 h-4" />
                <AlertDescription>
                  {filter === "pending"
                    ? "No pending approval requests at the moment."
                    : `No ${filter} requests found.`}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Teacher ID</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell className="font-medium">{approval.name}</TableCell>
                        <TableCell>{approval.email}</TableCell>
                        <TableCell>{approval.department}</TableCell>
                        <TableCell>{approval.teacherId}</TableCell>
                        <TableCell>{new Date(approval.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {approval.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                          {approval.status === "approved" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Approved
                            </Badge>
                          )}
                          {approval.status === "rejected" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {approval.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => handleApprove(approval.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() => handleReject(approval.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {approval.status !== "pending" && (
                            <span className="text-sm text-muted-foreground">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function HODDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["hod"]}>
      <HODDashboardContent />
    </ProtectedRoute>
  )
}
