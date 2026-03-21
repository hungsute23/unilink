import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "UniLink - Connect Schools, Businesses & Talent",
    template: "%s | UniLink",
  },
  description:
    "UniLink is the EdTech & Job platform connecting international students, universities, and career opportunities in Taiwan.",
  openGraph: {
    title: "UniLink - Connect Schools, Businesses & Talent",
    description: "UniLink is the EdTech & Job platform connecting international students, universities, and career opportunities in Taiwan.",
    url: "https://unilink-taiwan.example.com",
    siteName: "UniLink",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://unilink-taiwan.example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "UniLink Cover Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UniLink - Connect Schools, Businesses & Talent",
    description: "Connect with top universities and part-time jobs in Taiwan.",
    images: ["https://unilink-taiwan.example.com/og-image.png"],
  },
};

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AIChatWidget } from "@/components/shared/AIChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <AIChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
