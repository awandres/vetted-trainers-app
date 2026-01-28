import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vetted Trainers | Frederick MD Personal Training",
  description: "Vetted Trainers is Frederick, Maryland's premier personal training gym. Private, members-only facility offering strength training, mobility work, weight loss programs, and virtual training.",
  keywords: ["personal training", "frederick md", "gym", "weight loss", "mobility", "strength training"],
  openGraph: {
    title: "Vetted Trainers | Frederick MD Personal Training",
    description: "Train at our private, members-only gym in Frederick, Maryland. Personalized programs that get results.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
