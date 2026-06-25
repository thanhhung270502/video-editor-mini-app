import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReactQueryProvider } from "@/shared/components";

export const metadata: Metadata = {
  title: "VEM App - Video Editor Mini App",
  description: "Download YouTube videos, slice segments, apply transition effects, and export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-primary">
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#16162a",
                color: "#f0f0ff",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#16162a" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#16162a" },
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
