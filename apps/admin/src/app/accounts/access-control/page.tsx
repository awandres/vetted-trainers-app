"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vt/ui";
import {
  Shield,
  Clock,
  Ban,
  Check,
  RefreshCw,
  ArrowLeft,
  Loader2,
  UserX,
  Timer,
  AlertTriangle,
  Play,
  LogIn,
} from "lucide-react";

interface UserAccess {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accessDisabled: boolean | null;
  accessExpiresAt: string | null;
  accessDurationMinutes: number | null;
  lastLoginAt: string | null;
  lastLoginAttemptAt: string | null;
}

// Helper to format remaining time
function formatTimeRemaining(expiresAt: string): { text: string; expired: boolean; urgent: boolean } {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;
  
  if (diffMs <= 0) {
    return { text: "Expired", expired: true, urgent: false };
  }
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const remainingSeconds = diffSeconds % 60;
  
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return { text: `${hours}h ${mins}m remaining`, expired: false, urgent: false };
  }
  
  if (diffMinutes > 0) {
    return { 
      text: `${diffMinutes}m ${remainingSeconds}s remaining`, 
      expired: false, 
      urgent: diffMinutes < 2 
    };
  }
  
  return { 
    text: `${remainingSeconds}s remaining`, 
    expired: false, 
    urgent: true 
  };
}

export default function AccessControlPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState("5");
  const [now, setNow] = useState(Date.now());

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/access-control", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else if (res.status === 403) {
        toast.error("You don't have permission to view this page");
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (userId: string, action: string, value?: string) => {
    try {
      const res = await fetch("/api/admin/access-control", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action, value }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-purple-500/10 text-purple-400",
      admin: "bg-blue-500/10 text-blue-400",
      trainer: "bg-green-500/10 text-green-400",
      member: "bg-gray-500/10 text-gray-400",
    };
    return <Badge className={colors[role] || colors.member}>{role}</Badge>;
  };

  const getAccessStatus = (user: UserAccess) => {
    if (user.accessDisabled) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-red-500/10 text-red-400 w-fit">
            <Ban className="h-3 w-3 mr-1" /> Disabled
          </Badge>
        </div>
      );
    }
    
    // Check if there's an active time limit with expiry set
    if (user.accessExpiresAt) {
      const { text, expired, urgent } = formatTimeRemaining(user.accessExpiresAt);
      
      if (expired) {
        return (
          <div className="flex flex-col gap-1">
            <Badge className="bg-red-500/10 text-red-400 w-fit">
              <AlertTriangle className="h-3 w-3 mr-1" /> Time Expired
            </Badge>
            <span className="text-xs text-gray-500">
              {user.accessDurationMinutes ? `Was ${user.accessDurationMinutes} min limit` : `Expired ${new Date(user.accessExpiresAt).toLocaleString()}`}
            </span>
          </div>
        );
      }
      
      return (
        <div className="flex flex-col gap-1">
          <Badge className={urgent ? "bg-red-500/10 text-red-400 w-fit animate-pulse" : "bg-yellow-500/10 text-yellow-400 w-fit"}>
            <Timer className="h-3 w-3 mr-1" /> {text}
          </Badge>
          <span className="text-xs text-gray-500">
            {user.accessDurationMinutes ? `${user.accessDurationMinutes} min limit` : `Expires ${new Date(user.accessExpiresAt).toLocaleTimeString()}`}
          </span>
        </div>
      );
    }
    
    // Check for duration set but no expiry (timer starts on login)
    if (user.accessDurationMinutes) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-blue-500/10 text-blue-400 w-fit">
            <Clock className="h-3 w-3 mr-1" /> {user.accessDurationMinutes} min limit
          </Badge>
          <span className="text-xs text-gray-500">
            Timer starts when user logs in
          </span>
        </div>
      );
    }
    
    return (
      <Badge className="bg-green-500/10 text-green-400 w-fit">
        <Check className="h-3 w-3 mr-1" /> Active
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#3b82f6]" />
            Access Control
          </h1>
          <p className="text-gray-400">
            Manage user access permissions and time limits
          </p>
        </div>
      </div>

      {/* Quick Actions Card */}
      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Set up time-limited demo access for users. Timer starts immediately when set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">Select User</label>
              <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-[#2a2d36] border-[#454850] text-white">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent className="bg-[#353840] border-[#454850]">
                  {users
                    .filter(u => u.role !== "super_admin")
                    .map(user => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-32">
              <label className="text-sm text-gray-400 mb-2 block">Time Limit</label>
              <Select value={timeLimit} onValueChange={setTimeLimit}>
                <SelectTrigger className="bg-[#2a2d36] border-[#454850] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#353840] border-[#454850]">
                  <SelectItem value="5" className="text-white">5 minutes</SelectItem>
                  <SelectItem value="10" className="text-white">10 minutes</SelectItem>
                  <SelectItem value="15" className="text-white">15 minutes</SelectItem>
                  <SelectItem value="30" className="text-white">30 minutes</SelectItem>
                  <SelectItem value="60" className="text-white">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => selectedUser && handleAction(selectedUser, "set_time_limit", timeLimit)}
              disabled={!selectedUser}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
            
            <Button
              onClick={() => selectedUser && handleAction(selectedUser, "disable")}
              disabled={!selectedUser}
              variant="destructive"
            >
              <Ban className="h-4 w-4 mr-2" />
              Disable Access
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#353840] border-[#454850]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Users</CardTitle>
              <CardDescription className="text-gray-400">
                {users.length} users • Auto-refreshes every 30s
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="border-[#454850] text-gray-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#454850]">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Access Status</TableHead>
                <TableHead className="text-gray-400">Last Login</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} className="border-[#454850]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{user.name || "—"}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getAccessStatus(user)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {user.lastLoginAt ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <LogIn className="h-3 w-3" />
                          <span>{new Date(user.lastLoginAt).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Never logged in</span>
                      )}
                      {user.lastLoginAttemptAt && user.lastLoginAttemptAt !== user.lastLoginAt && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <span>Last attempt: {new Date(user.lastLoginAttemptAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role !== "super_admin" && (
                      <div className="flex flex-wrap gap-2">
                        {user.accessDisabled ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(user.id, "enable")}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Enable
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(user.id, "disable")}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Disable
                          </Button>
                        )}
                        
                        {(user.accessDurationMinutes || user.accessExpiresAt) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(user.id, "remove_time_limit")}
                            className="border-[#454850] text-gray-300"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Remove Limit
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(user.id, "revoke_sessions")}
                          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Logout
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
