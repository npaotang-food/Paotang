import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrderStatusNotifier } from "@/components/OrderStatusNotifier";
import DesktopSidebar from "@/components/DesktopSidebar";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "เป๋าตังค์ | ผลไม้ปอกสด ส่งถึงหน้าบ้าน",
  description: "เป๋าตังค์ — ผลไม้ปอกสดคุณภาพ A ส่งตรงถึงมือคุณ ส้ม สับปะรด แตงโม และอีกมากมาย",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* Leaflet CSS for Delivery Map */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#FF8C42" />
      </head>
      <body>
        <SplashScreen />
        <AuthProvider>
          <CartProvider>
            {/* Desktop Sidebar — hidden on mobile via CSS */}
            <DesktopSidebar />
            <div className="app-container">
              {children}
            </div>
            <OrderStatusNotifier />
          </CartProvider>
        </AuthProvider>

        {/* Leaflet JS loaded globally for Delivery Map components to use window.L */}
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin="" strategy="beforeInteractive" />
      </body>
    </html>
  );
}

