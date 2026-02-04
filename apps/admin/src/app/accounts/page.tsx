"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  ArrowLeft,
  Users,
  UserCog,
  Plus,
  Trash2,
  Check,
  Shield,
  ShieldCheck,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@vt/ui";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "trainer" | "member";
  trainerId: string | null;
  memberId: string | null;
  emailVerified: boolean;
  createdAt: string;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export default function AccountsPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"team" | "clients">("team");
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const isSuperAdmin = currentUser?.role === "super_admin";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [usersRes, trainersRes, membersRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/trainers"),
        fetch("/api/members"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (trainersRes.ok) {
        const data = await trainersRes.json();
        setTrainers(data.trainers || []);
      }
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteUser(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this account? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  // Filter users based on tab and search
  const teamUsers = users.filter(
    (u) => u.role === "admin" || u.role === "trainer"
  );
  const clientUsers = users.filter((u) => u.role === "member");

  const filteredTeamUsers = teamUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredClientUsers = clientUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">Admin</Badge>;
      case "trainer":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Trainer</Badge>;
      case "member":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Client</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 pl-12 lg:pl-0">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Account Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, roles, and access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {isSuperAdmin && (
                <Link href="/accounts/access-control">
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Control
                  </Button>
                </Link>
              )}
              <Link href="/accounts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trainers</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter((u) => u.role === "trainer").length}
                  </p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <UserCog className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter((u) => u.role === "member").length}
                  </p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "team" | "clients")}>
                <TabsList>
                  <TabsTrigger value="team" className="gap-2">
                    <UserCog className="h-4 w-4" />
                    Team Members
                    <Badge variant="secondary">{teamUsers.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="gap-2">
                    <Users className="h-4 w-4" />
                    Clients
                    <Badge variant="secondary">{clientUsers.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Team Members Tab */}
                {activeTab === "team" && (
                  <>
                    {filteredTeamUsers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No team accounts found</p>
                        <Link href="/accounts/new">
                          <Button variant="outline" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Team Account
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Linked Trainer</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTeamUsers.map((user) => {
                              const linkedTrainer = trainers.find((t) => t.id === user.trainerId);
                              return (
                                <TableRow 
                                  key={user.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => window.location.href = `/accounts/${user.id}`}
                                >
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{user.name || "No name"}</p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                                  <TableCell>
                                    {linkedTrainer ? (
                                      <span className="text-sm">
                                        {linkedTrainer.firstName} {linkedTrainer.lastName}
                                      </span>
                                    ) : user.role === "trainer" ? (
                                      <span className="text-sm text-muted-foreground">Not linked</span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">N/A</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {user.emailVerified ? (
                                      <Badge variant="outline" className="text-green-600">
                                        <Check className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-amber-600">
                                        Pending
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1">
                                      <Link href={`/accounts/${user.id}`}>
                                        <Button variant="ghost" size="sm">
                                          View
                                        </Button>
                                      </Link>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDeleteUser(user.id, e)}
                                        title="Delete Account"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}

                {/* Clients Tab */}
                {activeTab === "clients" && (
                  <>
                    {filteredClientUsers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No client accounts found</p>
                        <p className="text-sm mt-1">
                          Client accounts are created when members are added to the system
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Linked Member</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredClientUsers.map((user) => {
                              const linkedMember = members.find((m) => m.id === user.memberId);
                              return (
                                <TableRow 
                                  key={user.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => window.location.href = `/accounts/${user.id}`}
                                >
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{user.name || "No name"}</p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                                  <TableCell>
                                    {linkedMember ? (
                                      <span className="text-sm">
                                        {linkedMember.firstName} {linkedMember.lastName}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Not linked</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {user.emailVerified ? (
                                      <Badge variant="outline" className="text-green-600">
                                        <Check className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-amber-600">
                                        Pending
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1">
                                      <Link href={`/accounts/${user.id}`}>
                                        <Button variant="ghost" size="sm">
                                          View
                                        </Button>
                                      </Link>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDeleteUser(user.id, e)}
                                        title="Delete Account"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
