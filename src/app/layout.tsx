import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import { Providers } from "@/components/providers";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { GitHubLogo } from "@/components/icons/GitHubLogo";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Docker Explorer",
  description: "Explore your Docker containers, images, volumes, and networks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AppSidebar />
          <main className="flex-1 overflow-auto px-4">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 flex-grow">
                <SidebarTrigger className="-ml-1" />
                <DynamicBreadcrumbs />
              </div>
              <div className="ml-auto border-none">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="https://github.com/JoeBuildsStuff/docker-webui" target="_blank" rel="noopener noreferrer">
                      <GitHubLogo style={{ width: 18, height: 18 }} />
                    </Link>
                  </Button>
                  <ModeToggle />
                </div>
              </div>
            </header>
            <div className="mb-10">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
