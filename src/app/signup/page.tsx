"use client";

import { FormEvent, useState } from "react";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function SignupPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		try {
			setLoading(true);
			const params = new URLSearchParams({ email, password });
			const res = await fetch(`${API_BASE}/auth/signup?${params.toString()}`, { method: "POST" });
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data?.ok === false) {
				throw new Error(data?.detail || "Signup failed");
			}
			localStorage.setItem("role", data.role || "recruiter");
			router.push("/client");
		} catch (err: any) {
			alert(err.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h1 className="text-2xl font-semibold text-gray-900 text-center">Create account</h1>
				<p className="text-sm text-gray-500 text-center mt-1">Sign up as a general user</p>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
						<input
							id="name"
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
							placeholder="Jane Doe"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
							placeholder="client@example.com"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
						<input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
							placeholder="••••••••"
						/>
					</div>

				<button
						type="submit"
					className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-60"
					disabled={loading}
					>
					{loading && <Spinner size={16} />} Create account
					</button>
				</form>

				<div className="text-center text-sm text-gray-600 mt-4 space-y-2">
					<p>Already have an account? <Link href="/login" className="underline">Sign in</Link></p>
					<p>Are you a client? <Link href="/recruiter-signup" className="text-green-600 underline">Sign up here</Link></p>
				</div>
			</div>
		</div>
	);
}


