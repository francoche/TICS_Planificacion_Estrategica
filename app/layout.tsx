import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter-font",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-font",
  subsets: ["latin"],
  display: "swap",
});

import { AppNavbar } from "@/components/common/app-navbar";

export const metadata: Metadata = {
  title: "AquaMetrics - Sistema de Gestión y Telemetría",
  description:
    "Sistema de monitoreo, telemetría y gestión de parámetros hidroquímicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(inter.variable, plusJakartaSans.variable, geist.variable, "font-sans")}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground flex flex-col">
        <TooltipProvider>
          <AppNavbar />
          <div className="flex-1">
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
