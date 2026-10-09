import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "AquaMetrics Telemetría - Registro de Datos Hidroquímicos",
  description:
    "Sistema de monitoreo, telemetría y registro de parámetros hidroquímicos en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body className="text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        {children}
      </body>
    </html>
  );
}
