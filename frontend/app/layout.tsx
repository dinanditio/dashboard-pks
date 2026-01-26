import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { Providers } from "./providers"; // <-- HAPUS atau KOMENTARI baris ini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Isu Harian",
  description: "Analisis Isu Harian Fraksi PKS DPR RI",
  // Tambahan viewport untuk memastikan rendering mobile yang pas
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body className={`${inter.className} bg-white text-gray-900`}>
        {/* Hapus tag <Providers>, langsung render {children} */}
        {children}
      </body>
    </html>
  );
}