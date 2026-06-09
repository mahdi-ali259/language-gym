import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Language Gym",
  description: "Base project foundation for the Daily Language Gym MVP."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
