import type { Metadata } from "next";
import localFont from "next/font/local";

import { Navbar } from "@/components/navbar";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import "./globals.css";

const saans = localFont({
  src: [
    {
      path: "../public/fonts/Saans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Saans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Saans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Saans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-saans",
});

export const metadata: Metadata = {
  title: "Discover EU Startups | Startup List EU",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${saans.variable} antialiased`}
      >
        <SupabaseProvider initialSession={session}>
          <Navbar />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
