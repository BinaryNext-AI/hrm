"use client"

import { IconDashboard, IconReport, IconTimeline, IconUsers,IconLock } from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function ClientSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const items = [
    { title: "Overview", url: "/client", icon: IconDashboard },
    { title: "Workers", url: "/client", icon: IconUsers },
    { title: "EOD Reports", url: "/client/reports", icon: IconReport },
    { title: "Time Analytics", url: "/client/analytics", icon: IconTimeline },
    { title: "Change Password", url: "/client/change-password", icon: IconLock },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
              <span className="text-base font-semibold">Client</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}


