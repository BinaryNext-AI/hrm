"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast"; // or your toast library
import {   Loader2} from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const changePassword = async () => {
    if (!email || !oldPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setChanging(true);
    try {
      const params = new URLSearchParams({
        email,
        old_password: oldPassword,
        new_password: newPassword,
      });

      const res = await fetch(`${API_BASE}/auth/change-password?${params.toString()}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data?.ok) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(data?.detail || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while changing the password");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your recruiter or worker password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
            <Button
            onClick={changePassword}
            disabled={changing || !email || !oldPassword || !newPassword}
            className="w-full bg-green-600 hover:bg-green-700 h-12 flex items-center justify-center"
            >
            {changing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {changing ? "Changing..." : "Change Password"}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
