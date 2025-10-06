"use client";

import { FormEvent, useState } from "react";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("awais53562@gmail.com");
	const [password, setPassword] = useState("Awais@123");
	const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		try {
			setLoading(true);
			const params = new URLSearchParams({ email, password });
			const res = await fetch(`${API_BASE}/auth/login?${params.toString()}`, {
				method: "POST",
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.detail || "Login failed");
			}
			const data = await res.json();
			if (data?.ok === false) {
				throw new Error(data?.detail || "Login failed");
			}
			localStorage.setItem("role", data.role);
			if (data.email) localStorage.setItem("email", data.email);
			if (typeof data.id !== "undefined") localStorage.setItem("user_id", String(data.id));

			if (data.role === "admin") router.push("/admin");
			else if (data.role === "client" || data.role === "recruiter") router.push("/client");
			else if (data.role === "hire" || data.role === "worker") router.push("/hire");
			else setError("Unsupported role");
		} catch (err: any) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl text-center">Login</CardTitle>
					<CardDescription className="text-center">
						Sign in to access your dashboard
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && (
							<div className="rounded-md bg-red-50 p-4">
								<div className="text-sm text-red-700">{error}</div>
							</div>
						)}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <Spinner /> : "Sign in"}
						</Button>
					</form>
					<div className="mt-4 text-center text-sm">
						<span className="text-gray-600">No account? </span>
						<Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
							Create one
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


