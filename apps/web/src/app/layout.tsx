import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { PageTitleProvider } from "../contexts/PageTitleContext";
import { UserProvider } from "../contexts/UserContext";
import { AppShell } from "../components/layout/AppShell";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { themeInitScript } from "../lib/theme";
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
          <UserProvider>
            <PageTitleProvider>
              <AppShell>{children}</AppShell>
              <Toaster position="bottom-right" gutter={8} />
            </PageTitleProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
