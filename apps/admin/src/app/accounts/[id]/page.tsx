"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Shield,
  UserCog,
  Users,
  Key,
  Mail,
  Calendar,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Alert,
  AlertDescription,
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
  updatedAt: string;
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

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "trainer" | "member">("member");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("none");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("none");

  // Password reset
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [userRes, trainersRes, membersRes] = await Promise.all([
          fetch(`/api/accounts/${accountId}`),
          fetch("/api/trainers"),
          fetch("/api/members"),
        ]);

        if (!userRes.ok) {
          throw new Error("Account not found");
        }

        const userData = await userRes.json();
        setUser(userData.user);
        setName(userData.user.name || "");
        setRole(userData.user.role);
        setSelectedTrainerId(userData.user.trainerId || "none");
        setSelectedMemberId(userData.user.memberId || "none");

        if (trainersRes.ok) {
          const data = await trainersRes.json();
          setTrainers(data.trainers || []);
        }
        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(data.members || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  async function handleSave() {
    if (!user) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/accounts/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          role,
          trainerId: role === "trainer" && selectedTrainerId !== "none" ? selectedTrainerId : null,
          memberId: role === "member" && selectedMemberId !== "none" ? selectedMemberId : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update account");
      }

      const data = await res.json();
      setUser(data.user);
      alert("Account updated successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/accounts/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reset password");
      }

      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordReset(false);
      alert("Password reset successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleDelete() {
    if (!user) return;

    if (!confirm(`Are you sure you want to delete the account for ${user.email}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounts/${user.id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }

      router.push("/accounts");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function getRoleBadge(r: string) {
    switch (r) {
      case "admin":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">Admin</Badge>;
      case "trainer":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Trainer</Badge>;
      case "member":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Client</Badge>;
      default:
        return <Badge variant="secondary">{r}</Badge>;
    }
  }

  function getRoleIcon(r: string) {
    switch (r) {
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "trainer":
        return <UserCog className="h-5 w-5" />;
      case "member":
        return <Users className="h-5 w-5" />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3">
            <Link href="/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Accounts
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
          <p className="text-muted-foreground">{error || "The requested account could not be found."}</p>
        </main>
      </div>
    );
  }

  const linkedTrainer = trainers.find((t) => t.id === user.trainerId);
  const linkedMember = members.find((m) => m.id === user.memberId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 pl-12 lg:pl-0">
              <Link href="/accounts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{user.name || user.email}</h1>
                  {getRoleBadge(user.role)}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update the user's profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role & Access */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Access</CardTitle>
                <CardDescription>Configure the user's permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["admin", "trainer", "member"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          role === r
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                      >
                        <div className={role === r ? "text-primary" : "text-muted-foreground"}>
                          {getRoleIcon(r)}
                        </div>
                        <span className={`text-sm font-medium capitalize ${role === r ? "text-primary" : ""}`}>
                          {r}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {role === "trainer" && (
                  <div className="grid gap-2">
                    <Label>Link to Trainer Profile</Label>
                    <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trainer..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No link</SelectItem>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.firstName} {trainer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "member" && (
                  <div className="grid gap-2">
                    <Label>Link to Member Profile</Label>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No link</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Reset */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>Reset the user's password</CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordReset ? (
                  <Button variant="outline" onClick={() => setShowPasswordReset(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleResetPassword} disabled={isResettingPassword}>
                        {isResettingPassword ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Save Password
                      </Button>
                      <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Status</p>
                    {user.emailVerified ? (
                      <Badge variant="outline" className="text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Profile */}
            {(linkedTrainer || linkedMember) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Linked Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedTrainer && (
                    <Link href={`/trainers/${linkedTrainer.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <UserCog className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            {linkedTrainer.firstName} {linkedTrainer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">Trainer Profile</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  {linkedMember && (
                    <Link href={`/members/${linkedMember.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <Users className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">
                            {linkedMember.firstName} {linkedMember.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">Member Profile</p>
                        </div>
                      </div>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Deleting this account will permanently remove all access for this user.
                </p>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
