"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/components/common/Loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = true; // Change this based on real authentication logic

    if (!isAuthenticated && pathname !== "/auth/signin") {
      router.replace("/auth/signin"); // Redirect to the sign-in page
    } else {
      setLoading(false); // Set loading to false when authenticated or on the sign-in page
    }
  }, [pathname, router]);

  const hideSidebar = ["/auth/signin", "/auth/signup"].includes(pathname);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? (
            <Loader />
          ) : (
            <div className={`app-container ${hideSidebar ? "no-sidebar" : ""}`}>
              {!hideSidebar && (
                <aside className="sidebar">{/* Sidebar content */}</aside>
              )}
              <main className="main-content">{children}</main>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
