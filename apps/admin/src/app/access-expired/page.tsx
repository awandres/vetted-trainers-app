"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vt/ui";
import { ShieldX, Mail, ArrowRight } from "lucide-react";
import { signOut } from "@vt/auth/client";

export default function AccessExpiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  // Ensure user is signed out when landing on this page
  useEffect(() => {
    signOut().catch(() => {});
  }, []);

  const getMessage = () => {
    switch (reason) {
      case "disabled":
      case "expired":
      case "time_limit_exceeded":
        return {
          title: "Access Expired",
          description: "Your access has timed out. Please contact the system administrator for assistance.",
          showContact: true,
        };
      default:
        return {
          title: "Session Expired",
          description: "Your session has expired. Please log in again to continue.",
          showContact: false,
        };
    }
  };

  const { title, description, showContact } = getMessage();

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
        </div>

        <Card className="bg-[#353840] border-[#454850]">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <ShieldX className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-xl text-white">{title}</CardTitle>
            <CardDescription className="text-gray-400">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showContact && (
              <div className="p-4 rounded-lg bg-[#2a2d36] border border-[#454850]">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-[#50BFF4]" />
                  <div>
                    <p className="text-gray-400">Contact support:</p>
                    <a 
                      href="mailto:admin@demo-trainers.com" 
                      className="text-[#50BFF4] hover:underline"
                    >
                      admin@demo-trainers.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Return to Login
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Personal Trainers. All rights reserved.
        </p>
      </div>
    </div>
  );
}
