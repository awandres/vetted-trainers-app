"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@vt/auth/client";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@vt/ui";
import { Loader2, Mail, Lock, Shield, Dumbbell, User } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@demo-trainers.com", password: "demo123", label: "Admin", icon: Shield, description: "Full dashboard access" },
  { email: "trainer@demo-trainers.com", password: "demo123", label: "Trainer", icon: Dumbbell, description: "Trainer dashboard" },
  { email: "member@demo-trainers.com", password: "demo123", label: "Member", icon: User, description: "Client portal" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setDemoLoading(demoEmail);
    setError("");
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    try {
      const result = await signIn.email({ email: demoEmail, password: demoPassword });
      if (result.error) {
        setError(result.error.message || "Demo login failed. Please run: npx tsx scripts/seed-demo-accounts.ts");
        setDemoLoading(null);
        return;
      }
      
      const accessCheck = await fetch("/api/auth/track-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, success: true }),
      });
      
      const accessData = await accessCheck.json();
      
      if (!accessData.allowed) {
        await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
        setError(accessData.message || "Access has timed out.");
        setDemoLoading(null);
        return;
      }
      
      const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const userRole = sessionData?.user?.role || "member";
        window.location.href = userRole === "member" ? "/portal" : "/";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Demo login failed");
      setDemoLoading(null);
    }
  };

  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First, attempt sign in
      const result = await signIn.email({ email, password });
      if (result.error) {
        // Track failed login attempt
        await fetch("/api/auth/track-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, success: false }),
        });
        setError(result.error.message || "Failed to sign in");
        setLoading(false);
        return;
      }
      
      // Check if user has access (disabled/expired)
      const accessCheck = await fetch("/api/auth/track-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, success: true }),
      });
      
      const accessData = await accessCheck.json();
      
      if (!accessData.allowed) {
        // User's access is revoked - sign them out and show message
        await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
        setError(accessData.message || "Access has timed out. Please contact system admin.");
        setLoading(false);
        return;
      }
      
      // Fetch user role to determine redirect
      const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const userRole = sessionData?.user?.role || "member";
        
        // Redirect based on role - use hard redirect for production reliability
        let destination = "/";
        if (redirectUrl) {
          destination = redirectUrl;
        } else if (userRole === "member") {
          destination = "/portal";
        }
        
        // Use hard redirect for reliable navigation
        window.location.href = destination;
      } else {
        // Fallback: just go to home
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2a2d36] p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a2d36] via-[#353840] to-[#2a2d36]" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-20 w-20 rounded-xl bg-[#3b82f6] flex items-center justify-center">
              <span className="text-white font-bold text-3xl">PT</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Personal Trainers</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#2a2d36] border-[#454850] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-[#2a2d36] border-[#454850] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Account Quick Access */}
            <div className="mt-6 pt-6 border-t border-[#454850]">
              <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  const isLoading = demoLoading === account.email;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleDemoLogin(account.email, account.password)}
                      disabled={loading || demoLoading !== null}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#454850] hover:border-[#3b82f6] hover:bg-[#2a2d36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 text-[#3b82f6] animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-xs font-medium text-gray-300">{account.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Personal Trainers. All rights reserved.
        </p>
      </div>
    </div>
  );
}
