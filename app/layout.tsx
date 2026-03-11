import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIFEOS | Mission Control",
  description: "Life Operating System — mission control for your life.",
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
