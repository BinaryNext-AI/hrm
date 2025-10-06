"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (role !== "admin") router.replace("/login");
  }, [router]);

  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/recruiters", label: "Recruiters" },
    { href: "/admin/workers", label: "Workers" },
    { href: "/admin/assignments", label: "Assignments" },
    { href: "/admin/support", label: "Support Tickets" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 hidden md:block border-r border-gray-200 bg-white">
        <div className="px-4 py-4 text-lg font-semibold">Admin</div>
        <nav className="px-2 py-2 space-y-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`block rounded-md px-3 py-2 text-sm hover:bg-gray-100 ${pathname === i.href ? "bg-gray-100" : ""}`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}


