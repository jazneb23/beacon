import type { Metadata } from "next";
import Script from "next/script";

import { TopNav } from "../src/components/layout/TopNav";
import { ThemeProvider } from "../src/components/theme/ThemeProvider";
import { themeInitScript } from "../src/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beacon",
  description: "Beacon web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
