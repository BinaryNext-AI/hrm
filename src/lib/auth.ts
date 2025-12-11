/**
 * Authentication utilities for the HRM system
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

/**
 * Logout function that pauses tracking and clears authentication data
 * Note: This only PAUSES tracking - the workday continues until EOD submission
 */
export async function logout(): Promise<void> {
  const userId = localStorage.getItem('user_id');
  
  try {
    // Pause any active tracking sessions (don't end them completely)
    if (userId) {
      // Pause global session if active (sets end_at but keeps it resumable)
      try {
        await fetch(`${API_BASE}/time/global/pause?worker_id=${userId}`, { method: "POST" });
      } catch (error) {
        console.log("Failed to pause global session:", error);
      }
      
      // Pause any active task sessions
      try {
        await fetch(`${API_BASE}/time/task/pause/all?worker_id=${userId}`, { method: "POST" });
      } catch (error) {
        console.log("Failed to pause task sessions:", error);
      }
    }
    
    // Call logout endpoint if it exists
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
  } catch (error) {
    console.log("Logout API call failed, proceeding with local cleanup");
  }
  
  try {
    // Clear all authentication-related localStorage items
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    
    // Clear any other session data
    sessionStorage.clear();
  } catch (error) {
    console.log("Error clearing storage:", error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const role = localStorage.getItem('role');
  return !!role;
}

/**
 * Get current user role
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('role');
}

/**
 * Get current user email
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('email');
}

/**
 * Get current user ID
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('user_id');
}

/**
 * Redirect to appropriate dashboard based on user role
 */
export function redirectToDashboard(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "client":
    case "recruiter":
      return "/client";
    case "hire":
    case "worker":
      return "/hire";
    default:
      return "/login";
  }
}
