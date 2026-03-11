import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIFEOS | Mission Control",
  description: "Life Operating System — mission control for your life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#060B17] text-[#f1f5f9] font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
