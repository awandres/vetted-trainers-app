"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Separator,
} from "@vt/ui";
import { User, Mail, Phone, Bell, Lock, LogOut, Loader2, Save } from "lucide-react";

export default function PortalAccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch("/api/portal/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMember(data.member);
        }
      } catch (e) {
        console.error("Failed to fetch member:", e);
      }
    }
    if (user) fetchMember();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <User className="h-8 w-8 text-[#3b82f6]" />
          Account Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
      </div>

      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription className="text-gray-400">Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-gray-300">First Name</Label>
              <Input value={member?.firstName || ""} disabled className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Last Name</Label>
              <Input value={member?.lastName || ""} disabled className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2"><Mail className="h-4 w-4" />Email</Label>
            <Input value={user?.email || member?.email || ""} disabled className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2"><Phone className="h-4 w-4" />Phone</Label>
            <Input value={member?.phone || "Not provided"} disabled className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70" />
          </div>
          <p className="text-sm text-gray-500 mt-4">To update your profile, please contact your trainer.</p>
        </CardContent>
      </Card>

      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive updates via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator className="bg-[#454850]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Session Reminders</p>
              <p className="text-sm text-gray-400">Get reminded about upcoming sessions</p>
            </div>
            <Switch checked={sessionReminders} onCheckedChange={setSessionReminders} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#353840] border-[#454850]">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sign Out</p>
              <p className="text-sm text-gray-400">Sign out of your account</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
