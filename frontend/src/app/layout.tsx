import { AnalyticsProvider } from "@shared/providers/AnalyticsProvider";
import { QueryProvider } from "@shared/providers/QueryProvider";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "POS",
  description: "Point of sale terminal",
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout(props: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        <QueryProvider>
          <AnalyticsProvider>{props.children}</AnalyticsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
