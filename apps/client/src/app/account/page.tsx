"use client";

import { useState } from "react";
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
import {
  User,
  Mail,
  Phone,
  Bell,
  Lock,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";

export default function AccountPage() {
  const { user, member, signOut, isLoading: authLoading } = useAuth();
  
  // Form states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [prescriptionAlerts, setPrescriptionAlerts] = useState(true);
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false);
      } else {
        const data = await res.json();
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "An error occurred" });
    } finally {
      setPasswordLoading(false);
    }
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <User className="h-8 w-8 text-[#3b82f6]" />
          Account Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription className="text-gray-400">
            Your personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-gray-300">First Name</Label>
              <Input
                value={member?.firstName || ""}
                disabled
                className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Last Name</Label>
              <Input
                value={member?.lastName || ""}
                disabled
                className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              value={user?.email || member?.email || ""}
              disabled
              className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              value={member?.phone || "Not provided"}
              disabled
              className="bg-[#2a2d36] border-[#454850] text-white disabled:opacity-70"
            />
          </div>

          <p className="text-sm text-gray-500 mt-4">
            To update your profile information, please contact your trainer.
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive email updates and newsletters</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator className="bg-[#454850]" />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Session Reminders</p>
              <p className="text-sm text-gray-400">Get reminded about upcoming sessions</p>
            </div>
            <Switch
              checked={sessionReminders}
              onCheckedChange={setSessionReminders}
            />
          </div>
          
          <Separator className="bg-[#454850]" />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Prescription Alerts</p>
              <p className="text-sm text-gray-400">Be notified when you receive new exercises</p>
            </div>
            <Switch
              checked={prescriptionAlerts}
              onCheckedChange={setPrescriptionAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-[#353840] border-[#454850] mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(true)}
              className="border-[#454850] text-gray-300 hover:bg-[#2a2d36]"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  passwordMessage.type === "success" 
                    ? "bg-green-500/10 text-green-400" 
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {passwordMessage.type === "success" 
                    ? <CheckCircle className="h-4 w-4" />
                    : <AlertCircle className="h-4 w-4" />
                  }
                  {passwordMessage.text}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-gray-300">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-[#2a2d36] border-[#454850] text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-[#2a2d36] border-[#454850] text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-[#2a2d36] border-[#454850] text-white"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#3b82f6] hover:bg-[#2563eb]"
                >
                  {passwordLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordMessage(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="border-[#454850] text-gray-300 hover:bg-[#2a2d36]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="bg-[#353840] border-[#454850]">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sign Out</p>
              <p className="text-sm text-gray-400">Sign out of your account on this device</p>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
