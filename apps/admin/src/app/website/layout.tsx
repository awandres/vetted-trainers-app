"use client";

import { WebsiteWrapper } from "@/components/website";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebsiteWrapper isAdmin={true} showEditMode={true}>
      {children}
    </WebsiteWrapper>
  );
}
