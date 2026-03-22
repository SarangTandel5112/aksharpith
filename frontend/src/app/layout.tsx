// src/app/layout.tsx

import { Toaster } from "@shared/components/ui/sonner";
import { AnalyticsProvider } from "@shared/providers/AnalyticsProvider";
import { QueryProvider } from "@shared/providers/QueryProvider";
import { SessionProvider } from "@shared/providers/SessionProvider";
import { ThemeProvider } from "@shared/providers/ThemeProvider";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aksharpith Digital Catalog",
  description: "Product catalog and admin portal",
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout(props: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              <AnalyticsProvider>{props.children}</AnalyticsProvider>
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
