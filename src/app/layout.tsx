
import type { Metadata } from "next";
import { Suspense } from "react";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ConsoleFilter from "@/components/console-filter";
import { StaffProvider } from "@/context/staff-context";
import { StaffGate } from "@/components/staff-gate";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "phone mechanic",
  description: "Focus on recording customer information",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased ${ptSans.variable}`}>
        <StaffProvider>
          <Suspense fallback={null}>
            <StaffGate>
              {children}
            </StaffGate>
          </Suspense>
        </StaffProvider>
        <Toaster />
        <ConsoleFilter />
      </body>
    </html>
  );
}
