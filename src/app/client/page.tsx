"use client";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, TrendingUp } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ClientPage() {
    const [workers, setWorkers] = useState<Array<{id:number,email:string,role:string}>>([]);
    const [loading, setLoading] = useState(true);
    const [timeByWorker, setTimeByWorker] = useState<Record<number, number>>({});
    const [eodByWorker, setEodByWorker] = useState<Record<number, string>>({});
    const recruiterId = useMemo(()=> (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null), []);

    useEffect(() => {
        const id = recruiterId;
        if (!id) { setLoading(false); return; }
        (async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({ recruiter_id: String(id) });
                const res = await fetch(`${API_BASE}/recruiter/workers?${params.toString()}`, { cache: "no-store" });
                const data = await res.json();
                if (data?.ok !== false) setWorkers(data.items || []);
                // After workers are loaded, fetch per-worker summaries
                if (data?.items?.length) {
                    const items: Array<{id:number}> = data.items;
                    await Promise.all(items.map(async (w:any) => {
                        try {
                            const [tsRes, eodRes] = await Promise.all([
                                fetch(`${API_BASE}/time/task/summary?worker_id=${w.id}`, { cache: "no-store" }),
                                fetch(`${API_BASE}/reports/eod?worker_id=${w.id}`, { cache: "no-store" }),
                            ]);
                            const [tsData, eodData] = await Promise.all([tsRes.json(), eodRes.json()]);
                            if (tsData?.ok !== false && tsData?.item) {
                                setTimeByWorker(prev => ({ ...prev, [w.id]: Number(tsData.item.total_seconds || 0) }));
                            }
                            if (eodData?.ok !== false && Array.isArray(eodData.items) && eodData.items.length > 0) {
                                const recent = eodData.items[0];
                                setEodByWorker(prev => ({ ...prev, [w.id]: recent.accomplishments?.slice(0, 60) + (recent.accomplishments?.length > 60 ? '…' : '') }));
                            }
                        } catch {}
                    }));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [recruiterId]);

    const totalTime = Object.values(timeByWorker).reduce((sum, time) => sum + time, 0);
    const totalHours = Math.floor(totalTime / 3600);
    const totalMinutes = Math.floor((totalTime % 3600) / 60);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Client Dashboard</h1>
                        <p className="text-slate-600 mt-1">Manage your team and track productivity</p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Workers</CardTitle>
                            <User className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{workers.length}</div>
                            <p className="text-xs text-slate-500">Active team members</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Time</CardTitle>
                            <Clock className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{totalHours}h {totalMinutes}m</div>
                            <p className="text-xs text-slate-500">Across all workers</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Productivity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {workers.length > 0 ? Math.round((Object.keys(timeByWorker).length / workers.length) * 100) : 0}%
                            </div>
                            <p className="text-xs text-slate-500">Workers with activity</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Workers Table */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-900">Team Members</CardTitle>
                        <CardDescription>Manage tasks and track progress for each team member</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                                <span className="ml-2 text-slate-600">Loading workers...</span>
                            </div>
                        ) : workers.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">No workers assigned</h3>
                                <p className="mt-1 text-sm text-slate-500">Contact admin to assign workers to your team.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200">
                                        <TableHead className="font-semibold text-slate-700">Worker</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Total Time</TableHead>
                                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workers.map((w) => {
                                        const time = timeByWorker[w.id] || 0;
                                        const hours = Math.floor(time / 3600);
                                        const minutes = Math.floor((time % 3600) / 60);
                                        const hasActivity = time > 0;
                                        
                                        return (
                                            <TableRow key={w.id} className="border-slate-100 hover:bg-slate-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-slate-600" />
                                                        </div>
                                                        <span className="text-slate-900">{w.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                        <span className="font-mono text-slate-700">
                                                            {hours.toString().padStart(2,'0')}:{minutes.toString().padStart(2,'0')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        asChild
                                                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                                    >
                                                        <a href={`/client/workers/${w.id}`}>
                                                            Manage Tasks
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}