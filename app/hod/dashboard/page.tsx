"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Users, 
  Clock, 
  CheckCheck,
  Shield,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Mail,
  Briefcase,
  Hash
} from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = () => {
    const allApprovals = getPendingApprovals()
    setApprovals(allApprovals)
  }

  const handleApprove = async (approvalId: string) => {
    setIsProcessing(approvalId)
    
    try {
      const approval = approvals.find(a => a.id === approvalId)
      approveTeacher(approvalId)
      loadApprovals()
      
      toast({
        title: "Teacher Approved ✓",
        description: `${approval?.name} has been successfully approved and can now access the system.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve teacher. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (approvalId: string) => {
    setIsProcessing(approvalId)
    
    try {
      const approval = approvals.find(a => a.id === approvalId)
      rejectTeacher(approvalId)
      loadApprovals()
      
      toast({
        title: "Registration Rejected",
        description: `${approval?.name}'s registration request has been rejected.`,
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject teacher. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Filter and search approvals
  const filteredApprovals = approvals.filter((approval) => {
    const matchesFilter = filter === "all" || approval.status === filter
    const matchesSearch = searchQuery === "" || 
      approval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.teacherId.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const pendingCount = approvals.filter((a) => a.status === "pending").length
  const approvedCount = approvals.filter((a) => a.status === "approved").length
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-3 rounded-2xl shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HOD Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold">{user?.name}</span>
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
        {/* Welcome Banner */}
        {pendingCount > 0 && (
          <Card className="mb-6 border-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}</h3>
                    <p className="text-purple-50">Teacher registration requests awaiting your approval</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setFilter("pending")}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow-lg hidden md:flex"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-800">{pendingCount}</div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-green-50">Approved Teachers</CardTitle>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <CheckCheck className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{approvedCount}</div>
              <p className="text-xs text-green-100 mt-2">Total approved registrations</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-red-50">Rejected Requests</CardTitle>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-red-100 mt-2">Total rejected applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-2 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Teacher Registration Requests</CardTitle>
                  <CardDescription>Review and manage teacher account applications</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, department, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 border-gray-200"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                  className={filter === "pending" ? "bg-gradient-to-r from-purple-600 to-indigo-700" : "border-gray-200"}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                  {pendingCount > 0 && (
                    <Badge className="ml-2 bg-white text-purple-600 hover:bg-white">{pendingCount}</Badge>
                  )}
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("approved")}
                  className={filter === "approved" ? "bg-gradient-to-r from-purple-600 to-indigo-700" : "border-gray-200"}
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Approved
                </Button>
                <Button
                  variant={filter === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("rejected")}
                  className={filter === "rejected" ? "bg-gradient-to-r from-purple-600 to-indigo-700" : "border-gray-200"}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejected
                </Button>
                <Button 
                  variant={filter === "all" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-gradient-to-r from-purple-600 to-indigo-700" : "border-gray-200"}
                >
                  All
                </Button>
              </div>
            </div>

            {/* Results */}
            {filteredApprovals.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : filter === "pending"
                      ? "No pending approval requests"
                      : `No ${filter} requests found`
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery 
                      ? "Try adjusting your search terms"
                      : filter === "pending"
                      ? "All teacher registrations have been processed"
                      : "Check back later for updates"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Teacher Details</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Department</TableHead>
                        <TableHead className="font-semibold">Requested</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval, index) => (
                        <TableRow key={approval.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                {approval.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{approval.name}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {approval.teacherId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {approval.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              {approval.department}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(approval.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {approval.status === "pending" && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {approval.status === "approved" && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                            {approval.status === "rejected" && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {approval.status === "pending" ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  disabled={isProcessing === approval.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprove(approval.id)}
                                >
                                  {isProcessing === approval.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isProcessing === approval.id}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(approval.id)}
                                >
                                  {isProcessing === approval.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No actions available</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {filteredApprovals.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Showing {filteredApprovals.length} of {approvals.length} request{approvals.length !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        <Card className="mt-6 border-0 bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Administrative Control Panel</p>
                  <p className="text-xs text-gray-500">Manage teacher access and permissions</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-200 text-purple-600 px-3 py-1">
                HOD Access
              </Badge>
            </div>
          </CardContent>
        </Card>
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

export default function HODDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["hod"]}>
      <HODDashboardContent />
    </ProtectedRoute>
  )
}
