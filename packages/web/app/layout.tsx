import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

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
        {/* Kanit — clean modern Thai font */}
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#FF8C42" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <div className="app-container">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
