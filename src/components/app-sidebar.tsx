"use client"

import * as React from "react"
import {
  IconDashboard,
  IconReport,
  IconClock,
  IconUser,
  IconInnerShadowTop,
  IconHelp,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "Dashboard", url: "/hire", icon: IconDashboard },
    { title: "Time Tracking", url: "/hire", icon: IconClock },
    { title: "End of Day Report", url: "/hire/reports/eod", icon: IconReport },
    { title: "Support", url: "/hire/support", icon: IconHelp },
    { title: "My Tickets", url: "/hire/tickets", icon: IconReport },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconUser className="!size-5" />
                <span className="text-base font-semibold">Worker</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
