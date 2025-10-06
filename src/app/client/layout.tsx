"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (!(role === 'client' || role === 'recruiter')) router.replace('/login');
  }, [router]);

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}



