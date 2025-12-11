"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    UserCheck, 
    MessageSquare, 
    BarChart3, 
    Settings, 
    ArrowRight,
    Shield,
    Clock,
    TrendingUp
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        recruiters: 0,
        workers: 0,
        supportTickets: 0,
        activeWorkers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
        if (role !== "admin") {
            router.replace("/login");
        }
    }, [router]);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const [recruitersRes, workersRes, ticketsRes] = await Promise.all([
                fetch(`${API_BASE}/admin/recruiters`, { cache: "no-store" }),
                fetch(`${API_BASE}/admin/workers`, { cache: "no-store" }),
                fetch(`${API_BASE}/admin/support/tickets`, { cache: "no-store" })
            ]);

            const [recruitersData, workersData, ticketsData] = await Promise.all([
                recruitersRes.json(),
                workersRes.json(),
                ticketsRes.json()
            ]);

            setStats({
                recruiters: recruitersData.items?.length || 0,
                workers: workersData.items?.length || 0,
                supportTickets: ticketsData.tickets?.length || 0,
                activeWorkers: workersData.items?.length || 0 // Simplified for now
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <span className="ml-2 text-slate-600">Loading admin dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                    <p className="text-slate-600">Manage your HRM system and monitor all activities</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Clients</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.recruiters}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Employees</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.workers}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <UserCheck className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Support Tickets</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.supportTickets}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Active Employees</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.activeWorkers}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                User Management
                            </CardTitle>
                            <CardDescription>Manage clients and employees in your system</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/admin/recruiters">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900">Clients</h3>
                                            <p className="text-sm text-slate-600">Create and manage all clients</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-800">{stats.recruiters} active</Badge>
                                        <ArrowRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/workers">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <UserCheck className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900">Employees</h3>
                                            <p className="text-sm text-slate-600">Create and manage employees</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800">{stats.workers} total</Badge>
                                        <ArrowRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/assignments">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Settings className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900">Assignments</h3>
                                            <p className="text-sm text-slate-600">Assign employees to clients</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                Support & Analytics
                            </CardTitle>
                            <CardDescription>Monitor support tickets and system analytics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/admin/support">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <MessageSquare className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900">Support Tickets</h3>
                                            <p className="text-sm text-slate-600">Manage employee support requests</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-orange-100 text-orange-800">{stats.supportTickets} tickets</Badge>
                                        <ArrowRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900">Analytics Dashboard</h3>
                                        <p className="text-sm text-slate-600">System performance and insights</p>
                                    </div>
                                </div>
                                <Badge className="bg-slate-100 text-slate-600">Coming Soon</Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900">Time Reports</h3>
                                        <p className="text-sm text-slate-600">Worker time tracking reports</p>
                                    </div>
                                </div>
                                <Badge className="bg-slate-100 text-slate-600">Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Status */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            System Status
                        </CardTitle>
                        <CardDescription>Current system health and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">System Health</h3>
                                <p className="text-sm text-green-600">All systems operational</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">Active Users</h3>
                                <p className="text-sm text-slate-600">{stats.recruiters + stats.workers} total users</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">Support Queue</h3>
                                <p className="text-sm text-slate-600">{stats.supportTickets} pending tickets</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


