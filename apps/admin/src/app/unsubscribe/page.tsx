"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button, Card, CardContent } from "@vt/ui";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribed</h1>
            <p className="text-muted-foreground mb-6">
              You have been successfully unsubscribed from marketing emails.
              You will no longer receive promotional messages from Personal Trainers.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Note: You may still receive transactional emails related to your account,
              such as session reminders and prescription notifications.
            </p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error === "missing_email") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
            <p className="text-muted-foreground mb-6">
              This unsubscribe link appears to be invalid or expired.
              Please try clicking the link in your email again.
            </p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't process your unsubscribe request. Please try again
              or contact us at support@demo-trainers.com.
            </p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default landing page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Email Preferences</h1>
          <p className="text-muted-foreground mb-6">
            If you received this page in error, please contact us at
            support@demo-trainers.com for assistance with your email preferences.
          </p>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
