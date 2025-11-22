import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/navbar";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} antialiased`}
      >
        <SupabaseProvider initialSession={session}>
          <Navbar />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
