"use client";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, User, TrendingUp, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ClientPage() {
    const [employees, setEmployees] = useState<Array<{id:number,email:string,role:string}>>([]);
    const [loading, setLoading] = useState(true);
    const [timeByEmployee, setTimeByEmployee] = useState<Record<number, number>>({});
    const [eodByEmployee, setEodByEmployee] = useState<Record<number, string>>({});
    const clientId = useMemo(()=> (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null), []);
    
    // Create employee dialog state
    const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
    const [createEmployeeLoading, setCreateEmployeeLoading] = useState(false);
    const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
    const [newEmployeePassword, setNewEmployeePassword] = useState("");

    useEffect(() => {
        const id = clientId;
        if (!id) { setLoading(false); return; }
        (async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({ recruiter_id: String(id) });
                const res = await fetch(`${API_BASE}/recruiter/workers?${params.toString()}`, { cache: "no-store" });
                const data = await res.json();
                if (data?.ok !== false) setEmployees(data.items || []);
                // After employees are loaded, fetch per-employee summaries
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
                                setTimeByEmployee(prev => ({ ...prev, [w.id]: Number(tsData.item.total_seconds || 0) }));
                            }
                            if (eodData?.ok !== false && Array.isArray(eodData.items) && eodData.items.length > 0) {
                                const recent = eodData.items[0];
                                setEodByEmployee(prev => ({ ...prev, [w.id]: recent.accomplishments?.slice(0, 60) + (recent.accomplishments?.length > 60 ? '…' : '') }));
                            }
                        } catch {}
                    }));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [clientId]);

    const totalTime = Object.values(timeByEmployee).reduce((sum, time) => sum + time, 0);
    const totalHours = Math.floor(totalTime / 3600);
    const totalMinutes = Math.floor((totalTime % 3600) / 60);

    async function createEmployee() {
        if (!clientId) {
            toast.error("Client ID not found");
            return;
        }

        if (!newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
            toast.error("Email and password are required");
            return;
        }

        if (newEmployeePassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setCreateEmployeeLoading(true);
            const params = new URLSearchParams({
                recruiter_id: clientId,
                email: newEmployeeEmail.trim(),
                password: newEmployeePassword
            });

            const res = await fetch(`${API_BASE}/recruiter/workers?${params.toString()}`, {
                method: "POST"
            });

            const data = await res.json();

            if (!res.ok || data?.ok === false) {
                throw new Error(data?.detail || "Failed to create employee");
            }

            toast.success("Employee created successfully!");
            setCreateEmployeeOpen(false);
            setNewEmployeeEmail("");
            setNewEmployeePassword("");
            
            // Refresh the employees list
            window.location.reload();

        } catch (err: any) {
            toast.error(err.message || "Failed to create employee");
        } finally {
            setCreateEmployeeLoading(false);
        }
    }

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
                        <CardTitle className="text-sm font-medium text-slate-600">Total Employees</CardTitle>
                        <User className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
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
                                {employees.length > 0 ? Math.round((Object.keys(timeByEmployee).length / employees.length) * 100) : 0}%
                            </div>
                            <p className="text-xs text-slate-500">Employees with activity</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Workers Table */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900">Team Members</CardTitle>
                                <CardDescription>Manage tasks and track progress for each team member</CardDescription>
                            </div>
                            <Sheet open={createEmployeeOpen} onOpenChange={setCreateEmployeeOpen}>
                                <SheetTrigger asChild>
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Employee
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Create New Employee</SheetTitle>
                                        <SheetDescription>
                                            Add a new employee to your team. They will be automatically assigned to you.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="space-y-4 mt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="employee-email">Email Address</Label>
                                            <Input
                                                id="employee-email"
                                                type="email"
                                                placeholder="employee@company.com"
                                                value={newEmployeeEmail}
                                                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                                                disabled={createEmployeeLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="employee-password">Password</Label>
                                            <Input
                                                id="employee-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={newEmployeePassword}
                                                onChange={(e) => setNewEmployeePassword(e.target.value)}
                                                disabled={createEmployeeLoading}
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCreateEmployeeOpen(false)}
                                                disabled={createEmployeeLoading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={createEmployee}
                                                disabled={createEmployeeLoading}
                                                className="bg-slate-900 hover:bg-slate-800"
                                            >
                                                {createEmployeeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Employee
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                                <span className="ml-2 text-slate-600">Loading employees...</span>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">No employees in your team</h3>
                                <p className="mt-1 text-sm text-slate-500">Create your first employee to get started.</p>
                                <Sheet open={createEmployeeOpen} onOpenChange={setCreateEmployeeOpen}>
                                    <SheetTrigger asChild>
                                        <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Employee
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Create New Employee</SheetTitle>
                                            <SheetDescription>
                                                Add a new employee to your team. They will be automatically assigned to you.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="space-y-4 mt-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="employee-email-empty">Email Address</Label>
                                                <Input
                                                    id="employee-email-empty"
                                                    type="email"
                                                    placeholder="employee@company.com"
                                                    value={newEmployeeEmail}
                                                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                                                    disabled={createEmployeeLoading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="employee-password-empty">Password</Label>
                                                <Input
                                                    id="employee-password-empty"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={newEmployeePassword}
                                                    onChange={(e) => setNewEmployeePassword(e.target.value)}
                                                    disabled={createEmployeeLoading}
                                                    minLength={6}
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCreateEmployeeOpen(false)}
                                                    disabled={createEmployeeLoading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={createEmployee}
                                                    disabled={createEmployeeLoading}
                                                    className="bg-slate-900 hover:bg-slate-800"
                                                >
                                                    {createEmployeeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Create Employee
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200">
                                        <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Total Time</TableHead>
                                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((w) => {
                                        const time = timeByEmployee[w.id] || 0;
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