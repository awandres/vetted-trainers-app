"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn } from "@vt/auth/client";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@vt/ui";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        
        // Redirect based on role
        if (redirectUrl) {
          // If there's a specific redirect, use it (unless it's a portal route and user isn't a member)
          router.push(redirectUrl);
        } else if (userRole === "member") {
          // Members go to the portal
          router.push("/portal");
        } else {
          // Admin, trainers, super_admin go to the dashboard
          router.push("/");
        }
      } else {
        // Fallback: just go to home and let the page handle it
        router.push("/");
      }
    } catch (err) {
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
            <Image
              src="/images/vt/VT Logos/vetted-logo-white.png"
              alt="Vetted Trainers"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Vetted Trainers</h1>
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
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Vetted Trainers. All rights reserved.
        </p>
      </div>
    </div>
  );
}
