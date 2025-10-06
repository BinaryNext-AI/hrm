"use client";

import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
    } catch {}
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
    } catch {}
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
    >
      Logout
    </button>
  );
}


