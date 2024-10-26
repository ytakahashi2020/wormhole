"use client";

import "@/app/globals.css";
import UtilProvider from "@/app/context/UtilProvider";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import AppWalletProvider from "@/app/context/AppWalletProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <UtilProvider>
            <header
              className="p-4 fixed z-20 w-full"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            >
              <nav className="flex justify-end items-center space-x-4">
                <div className="ml-4">
                  <WalletMultiButton style={{}} />
                </div>
              </nav>
            </header>
            {children}
          </UtilProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
