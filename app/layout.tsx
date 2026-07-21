import type { Metadata } from "next";
import "./globals.css";

import LoadingBar from "@/components/basic/LoadingBar";
import RouteLoadingOverlay from "@/components/basic/RouteLoadingOverlay";
import { Suspense } from "react";
import { UIProvider } from "@/components/providers/ui-provider";

export const metadata: Metadata = {
  title: "grad360 | Portal",
  description: "Secure access to the Placement Readiness Intelligence Platform",
  icons: {
    icon: "/grad360favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        <UIProvider>
          <Suspense fallback={null}>
            <LoadingBar />
            <RouteLoadingOverlay />
          </Suspense>
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
