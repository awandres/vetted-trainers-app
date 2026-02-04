"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Shield,
  UserCog,
  Users,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@vt/ui";

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

export default function NewAccountPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "trainer" | "member">("trainer");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("none");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("none");

  useEffect(() => {
    async function fetchData() {
      try {
        const [trainersRes, membersRes] = await Promise.all([
          fetch("/api/trainers"),
          fetch("/api/members"),
        ]);

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
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || null,
          password,
          role,
          trainerId: role === "trainer" && selectedTrainerId !== "none" ? selectedTrainerId : null,
          memberId: role === "member" && selectedMemberId !== "none" ? selectedMemberId : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create account");
      }

      const data = await res.json();
      router.push(`/accounts/${data.user.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
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
                <h1 className="text-xl font-bold">Create Account</h1>
                <p className="text-sm text-muted-foreground">
                  Add a new user to the system
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Create a new user account with login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selection */}
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
                <p className="text-xs text-muted-foreground">
                  {role === "admin" && "Full access to all features and settings"}
                  {role === "trainer" && "Access to their assigned clients and sessions"}
                  {role === "member" && "Client portal access only"}
                </p>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
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
              </div>

              <Separator />

              {/* Password */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Role-specific linking */}
              {role === "trainer" && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <Label htmlFor="trainer">Link to Trainer Profile</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Link this account to a trainer profile for role-specific access
                    </p>
                  </div>
                </>
              )}

              {role === "member" && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <Label htmlFor="member">Link to Member Profile</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Link this account to a member profile for portal access
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/accounts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Account
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
