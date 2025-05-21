import type React from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { SearchProvider } from "@/contexts/SearchContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pulse",
  description: "Healthcare on demand",
  icons: {
    icon: "/logo.ico", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <UserProvider>
          <SearchProvider>
            {children}
            <Toaster position="top-right" />
          </SearchProvider>
        </UserProvider>
      </body>
    </html>
  );
}
