import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CultureLense",
  description: "Discover cultural entities",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
