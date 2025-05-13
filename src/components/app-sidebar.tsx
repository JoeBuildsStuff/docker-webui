"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
  import { ChartNoAxesCombined, Container, Cloud, HardDrive, Network } from "lucide-react"
import { SidebarLogo } from "./app-sidebar-logo"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Menu items.
const items = [
    {
        name: "Dashboard",
        path: "/",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Containers",
        path: "/containers",
        icon: Container,
      },
      {
        name: "Images",
        path: "/images",
        icon: Cloud,
      },
      {
        name: "Volumes",
        path: "/volumes",
        icon: HardDrive,
      },
      {
        name: "Networks",
        path: "/networks",
        icon: Network,
      },
  ]

  export function AppSidebar() {
    const pathname = usePathname()

   console.log(pathname)


    return (
      <Sidebar>
        <SidebarHeader>
        <SidebarLogo />
        </SidebarHeader>
        <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full justify-start", // Default classes
                      pathname === item.path
                        ? "bg-muted/50 hover:bg-muted" // Active classes
                        : "hover:bg-muted" // Inactive classes
                    )}
                  >
                    <a href={item.path}>
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="">

        </SidebarFooter>
      </Sidebar>
    )
  }
  