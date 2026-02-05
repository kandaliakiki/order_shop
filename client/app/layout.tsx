import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--dmsans",
});

export const metadata: Metadata = {
  title: "BakeryHub - Bakery Management System",
  description: "Complete bakery management and POS system with inventory tracking, order management, and WhatsApp integration",
  icons: {
    icon: "/assets/bakery-hub-logo.png",
    apple: "/assets/bakery-hub-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
