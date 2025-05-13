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
  import { Home, Container, Cloud, HardDrive, Network } from "lucide-react"
import { SidebarLogo } from "./app-sidebar-logo"

// Menu items.
const items = [
    {
        name: "Dashboard",
        path: "/",
        icon: Home,
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
                //   variant="outline"
                  >
                    <a href={item.path}>
                      <item.icon />
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
  