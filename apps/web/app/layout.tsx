import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { PageTitleProvider } from "../src/contexts/PageTitleContext";
import { UserProvider } from "../src/contexts/UserContext";
import { AppShell } from "../src/components/layout/AppShell";
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
