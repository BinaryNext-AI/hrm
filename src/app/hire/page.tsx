"use client";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Clock, 
    Play, 
    Pause, 
    CheckCircle, 
    AlertCircle, 
    PlayCircle, 
    User, 
    Calendar,
    Target,
    Activity,
    MousePointer,
    Keyboard,
    RotateCcw
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function HirePage() {
    const [tasks, setTasks] = useState<Array<{id:number,title:string,description:string|null,priority:string,due_date:string|null,created_at:string,status:string}>>([]);
    const [loading, setLoading] = useState(true);
    const [today, setToday] = useState<{check_in:string|null,check_out:string|null}|null>(null);
    const [globalActive, setGlobalActive] = useState(false);
    const [globalStartedAt, setGlobalStartedAt] = useState<number | null>(null);
    const [globalElapsed, setGlobalElapsed] = useState(0);
    const [globalBaseElapsed, setGlobalBaseElapsed] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [keyCount, setKeyCount] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [moveCount, setMoveCount] = useState(0);

    async function load() {
        setLoading(true);
        try {
            const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
            if (!id) { setTasks([]); return; }
            const res = await fetch(`${API_BASE}/tasks?worker_id=${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data?.ok !== false) setTasks(data.items || []);
            const t = await fetch(`${API_BASE}/time/today?worker_id=${id}`, { cache: 'no-store' }).then(r=>r.json());
            if (t?.ok !== false) setToday(t.item || null);
            
            // Check if we need to reset the timer (new day)
            const lastResetDate = typeof window !== 'undefined' ? localStorage.getItem('lastResetDate') : null;
            const today = new Date().toDateString();
            
            if (lastResetDate !== today) {
                // New day - reset the timer
                setGlobalElapsed(0);
                setGlobalBaseElapsed(0);
                setGlobalActive(false);
                setGlobalStartedAt(null);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lastResetDate', today);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    // Cleanup function to stop tracking when component unmounts or user navigates away
    useEffect(() => {
        const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
            if (globalActive || activeTaskId) {
                // Stop active sessions before page unload
                const id = localStorage.getItem('user_id');
                if (id) {
                    if (globalActive) {
                        navigator.sendBeacon(`${API_BASE}/time/global/stop?worker_id=${id}`, '');
                    }
                    if (activeTaskId) {
                        const params = new URLSearchParams({ 
                            worker_id: id, 
                            task_id: String(activeTaskId),
                            keystrokes: String(keyCount),
                            mouse_clicks: String(clickCount),
                            mouse_moves: String(moveCount)
                        });
                        navigator.sendBeacon(`${API_BASE}/time/task/stop?${params.toString()}`, '');
                    }
                }
            }
        };

        const handleVisibilityChange = async () => {
            if (document.hidden && (globalActive || activeTaskId)) {
                // Page is being hidden, stop active sessions
                const id = localStorage.getItem('user_id');
                if (id) {
                    try {
                        if (globalActive) {
                            await fetch(`${API_BASE}/time/global/stop?worker_id=${id}`, { method: 'POST' });
                            setGlobalActive(false);
                        }
                        if (activeTaskId) {
                            const params = new URLSearchParams({ 
                                worker_id: id, 
                                task_id: String(activeTaskId),
                                keystrokes: String(keyCount),
                                mouse_clicks: String(clickCount),
                                mouse_moves: String(moveCount)
                            });
                            await fetch(`${API_BASE}/time/task/stop?${params.toString()}`, { method: 'POST' });
                            setActiveTaskId(null);
                        }
                    } catch (error) {
                        console.log('Failed to stop sessions on visibility change:', error);
                    }
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [globalActive, activeTaskId, keyCount, clickCount, moveCount]);

    // Load global elapsed on mount
    useEffect(() => {
        (async () => {
            const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
            if (!id) return;
            const res = await fetch(`${API_BASE}/time/global/summary?worker_id=${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data?.ok !== false && data.item) {
                const base = Number(data.item.elapsed_seconds || 0);
                setGlobalBaseElapsed(base);
                setGlobalElapsed(base);
                if (data.item.active) {
                    setGlobalActive(true);
                    setGlobalStartedAt(Date.now()); // we continue ticking from now on top of elapsed base
                }
            }
        })();
    }, []);

    // Reset timer at midnight (daily reset)
    useEffect(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        const timeoutId = setTimeout(() => {
            // Reset the timer at midnight
            setGlobalElapsed(0);
            setGlobalBaseElapsed(0);
            setGlobalActive(false);
            setGlobalStartedAt(null);
            
            // Reload data to get fresh daily data
            load();
        }, msUntilMidnight);

        return () => clearTimeout(timeoutId);
    }, []);

    // Global timer tick (base + running delta)
    useEffect(() => {
        const timer = setInterval(() => {
            if (globalStartedAt) {
                const delta = Math.floor((Date.now() - globalStartedAt) / 1000);
                setGlobalElapsed(globalBaseElapsed + delta);
            } else {
                setGlobalElapsed(globalBaseElapsed);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [globalStartedAt, globalBaseElapsed]);

    // Handlers for per-task tracking (basic counts)
    useEffect(() => {
        function onKey() { setKeyCount((c)=>c+1); }
        function onClick() { setClickCount((c)=>c+1); }
        function onMove() { setMoveCount((c)=>c+1); }
        if (activeTaskId) {
            window.addEventListener('keydown', onKey);
            window.addEventListener('mousedown', onClick);
            window.addEventListener('mousemove', onMove);
        }
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('mousedown', onClick);
            window.removeEventListener('mousemove', onMove);
        };
    }, [activeTaskId]);

    function formatElapsed(sec: number) {
        const h = Math.floor(sec/3600).toString().padStart(2,'0');
        const m = Math.floor((sec%3600)/60).toString().padStart(2,'0');
        const s = Math.floor(sec%60).toString().padStart(2,'0');
        return `${h}:${m}:${s}`;
    }

    async function setStatus(taskId: number, status: string) {
        const params = new URLSearchParams({ task_id: String(taskId), status });
        const res = await fetch(`${API_BASE}/tasks/status?${params.toString()}`, { method: 'POST' });
        const data = await res.json();
        if (data?.ok !== false) load();
    }

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => (t.status || 'todo') === 'todo').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'todo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Employee Dashboard</h1>
                        <p className="text-slate-600 mt-1">Track your tasks, time, and daily progress</p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
                            <Target className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
                            <p className="text-xs text-slate-500">Assigned tasks</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{completedTasks}</div>
                            <p className="text-xs text-slate-500">Tasks finished</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{inProgressTasks}</div>
                            <p className="text-xs text-slate-500">Currently working</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
                            <Activity className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{progressPercentage}%</div>
                            <p className="text-xs text-slate-500">Completion rate</p>
                        </CardContent>
                    </Card>
                </div>


                {/* Daily Attendance Summary - Show status */}
                <Card className={`border-0 shadow-lg bg-white ${today?.check_in ? 'border-l-4 border-l-green-500' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {today?.check_in && today?.check_out ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <User className="h-5 w-5 text-slate-600" />
                            )}
                            Daily Attendance
                        </CardTitle>
                        <CardDescription>
                            {today?.check_in && today?.check_out 
                                ? "You have completed your daily check-in and check-out" 
                                : "Start the timer below to automatically check in"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                today?.check_in && today?.check_out ? 'bg-green-100' : 'bg-slate-100'
                            }`}>
                                {today?.check_in && today?.check_out ? (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                ) : (
                                    <Calendar className="h-6 w-6 text-slate-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {today?.check_in && today?.check_out ? 'Work Day Complete' : "Today's Status"}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {today?.check_in ? `Checked in at ${today.check_in}` : "Not checked in yet"}
                                    {today?.check_out ? ` • Checked out at ${today.check_out}` : ""}
                                </p>
                                {!today?.check_in && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        💡 Tip: Check-in will happen automatically when you start the timer below
                                    </p>
                                )}
                            </div>
                            {/* Manual Check-out Button - Only show if checked in but not checked out */}
                            {today?.check_in && !today?.check_out && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={async ()=>{
                                        const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                        if (!id) return;
                                        const res = await fetch(`${API_BASE}/time/check-out?worker_id=${id}`, { method: 'POST' });
                                        const d = await res.json(); 
                                        if (d?.ok !== false) { 
                                            toast.success('Checked out successfully'); 
                                            load(); 
                                        }
                                    }}
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Check Out
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Global Time Tracking */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-slate-600" />
                            Daily Time Tracking
                        </CardTitle>
                        <CardDescription>
                            Track your 8-hour work day with automatic time recording
                            {!today?.check_in && (
                                <span className="text-blue-600 font-medium"> • Starting timer will check you in automatically</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                    globalActive ? 'bg-green-100' : 'bg-slate-100'
                                }`}>
                                    {globalActive ? (
                                        <Play className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <Pause className="h-6 w-6 text-slate-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {globalActive ? 'Time Tracking Active' : 'Time Tracking Stopped'}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {globalActive ? `Running ${formatElapsed(globalElapsed)} / 08:00:00` : "Click resume to start tracking"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Turn this on as proof that you are actively working
                                    </p>
                                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                                        <p className="text-xs text-orange-700 font-medium">
                                            ⚠️ We are monitoring your screen activity to ensure you are actually working
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!globalActive ? (
                                    <Button 
                                        onClick={async ()=>{
                                            const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                            if (!id) return;
                                            const res = await fetch(`${API_BASE}/time/global/resume?worker_id=${id}`, { method: 'POST' });
                                            const d = await res.json(); 
                                            if (d?.ok !== false) { 
                                                setGlobalActive(true); 
                                                setGlobalStartedAt(Date.now()); 
                                                setGlobalElapsed(globalBaseElapsed); 
                                                
                                                // Show appropriate message based on check-in status
                                                if (!today?.check_in) {
                                                    toast.success('Checked in and tracking started!'); 
                                                } else {
                                                    toast.success('Tracking resumed'); 
                                                }
                                                
                                                load(); // Reload to update check-in status
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {!today?.check_in ? 'Start & Check In' : 'Resume'}
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline"
                                        onClick={async ()=>{
                                            const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                            if (!id) return;
                                            const res = await fetch(`${API_BASE}/time/global/stop?worker_id=${id}`, { method: 'POST' });
                                            const d = await res.json(); 
                                            if (d?.ok !== false) { 
                                                setGlobalActive(false); 
                                                setGlobalStartedAt(null); 
                                                setGlobalBaseElapsed(globalElapsed); 
                                                toast.success('Tracking paused'); 
                                            }
                                        }}
                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-6">
                    {loading ? (
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="py-12">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                                    <span className="ml-2 text-slate-600">Loading tasks...</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : tasks.length === 0 ? (
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Target className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks assigned</h3>
                                    <p className="mt-1 text-sm text-slate-500">Your recruiter will assign tasks to you soon.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Pending Tasks */}
                            {tasks.filter(t => (t.status || 'todo') === 'todo').length > 0 && (
                                <Card className="border-0 shadow-lg bg-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-yellow-600" />
                                            Pending Tasks ({tasks.filter(t => (t.status || 'todo') === 'todo').length})
                                        </CardTitle>
                                        <CardDescription>Tasks waiting to be started</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {tasks.filter(t => (t.status || 'todo') === 'todo').map((t) => (
                                                <div key={t.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-medium text-slate-900">{t.title}</h4>
                                                                <Badge className={getPriorityColor(t.priority)}>
                                                                    {t.priority}
                                                                </Badge>
                                                            </div>
                                                            {t.description && (
                                                                <p className="text-sm text-slate-600 mb-2">{t.description}</p>
                                                            )}
                                                            {t.due_date && (
                                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Due: {new Date(t.due_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={async ()=>{
                                                                const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                                                if (!id) return;
                                                                const params = new URLSearchParams({ 
                                                                    worker_id: String(id), 
                                                                    task_id: String(t.id) 
                                                                });
                                                                const res = await fetch(`${API_BASE}/time/task/start?${params.toString()}`, { method: 'POST' });
                                                                const d = await res.json(); 
                                                                if (d?.ok !== false) { 
                                                                    setActiveTaskId(t.id); 
                                                                    await setStatus(t.id,'in_progress'); 
                                                                    toast.success('Task tracking started'); 
                                                                }
                                                            }}
                                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Play className="h-4 w-4 mr-1" />
                                                            Start Tracking
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* In Progress Tasks */}
                            {tasks.filter(t => (t.status || 'todo') === 'in_progress').length > 0 && (
                                <Card className="border-0 shadow-lg bg-white border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-blue-600" />
                                            In Progress Tasks ({tasks.filter(t => (t.status || 'todo') === 'in_progress').length})
                                        </CardTitle>
                                        <CardDescription>Tasks currently being worked on with activity tracking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {tasks.filter(t => (t.status || 'todo') === 'in_progress').map((t) => (
                                                <div key={t.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-medium text-slate-900">{t.title}</h4>
                                                                <Badge className={getPriorityColor(t.priority)}>
                                                                    {t.priority}
                                                                </Badge>
                                                                {activeTaskId === t.id && (
                                                                    <Badge className="bg-green-100 text-green-800">
                                                                        <Activity className="h-3 w-3 mr-1" />
                                                                        Tracking
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {t.description && (
                                                                <p className="text-sm text-slate-600 mb-2">{t.description}</p>
                                                            )}
                                                            {t.due_date && (
                                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Due: {new Date(t.due_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={()=>setStatus(t.id,'done')}
                                                                className="border-green-200 text-green-700 hover:bg-green-50"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Mark Done
                                                            </Button>
                                                            {activeTaskId === t.id ? (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={async ()=>{
                                                                        const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                                                        if (!id) return;
                                                                        const params = new URLSearchParams({ 
                                                                            worker_id: String(id), 
                                                                            task_id: String(t.id), 
                                                                            keystrokes: String(keyCount), 
                                                                            mouse_clicks: String(clickCount), 
                                                                            mouse_moves: String(moveCount) 
                                                                        });
                                                                        const res = await fetch(`${API_BASE}/time/task/stop?${params.toString()}`, { method: 'POST' });
                                                                        const d = await res.json();
                                                                        if (d?.ok !== false) { 
                                                                            setActiveTaskId(null); 
                                                                            setKeyCount(0); 
                                                                            setClickCount(0); 
                                                                            setMoveCount(0); 
                                                                            toast.success('Task tracking stopped'); 
                                                                        }
                                                                    }}
                                                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Pause className="h-4 w-4 mr-1" />
                                                                    Stop Tracking
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={async ()=>{
                                                                        const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
                                                                        if (!id) return;
                                                                        const params = new URLSearchParams({ 
                                                                            worker_id: String(id), 
                                                                            task_id: String(t.id) 
                                                                        });
                                                                        const res = await fetch(`${API_BASE}/time/task/start?${params.toString()}`, { method: 'POST' });
                                                                        const d = await res.json(); 
                                                                        if (d?.ok !== false) { 
                                                                            setActiveTaskId(t.id); 
                                                                            toast.success('Task tracking resumed'); 
                                                                        }
                                                                    }}
                                                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                >
                                                                    <Play className="h-4 w-4 mr-1" />
                                                                    Resume Tracking
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Completed Tasks */}
                            {tasks.filter(t => (t.status || 'todo') === 'done').length > 0 && (
                                <Card className="border-0 shadow-lg bg-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Completed Tasks ({tasks.filter(t => (t.status || 'todo') === 'done').length})
                                        </CardTitle>
                                        <CardDescription>Tasks that have been finished</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {tasks.filter(t => (t.status || 'todo') === 'done').map((t) => (
                                                <div key={t.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-medium text-slate-900 line-through">{t.title}</h4>
                                                                <Badge className={getPriorityColor(t.priority)}>
                                                                    {t.priority}
                                                                </Badge>
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Completed
                                                                </Badge>
                                                            </div>
                                                            {t.description && (
                                                                <p className="text-sm text-slate-600 mb-2 line-through">{t.description}</p>
                                                            )}
                                                            {t.due_date && (
                                                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Due: {new Date(t.due_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={()=>setStatus(t.id,'in_progress')}
                                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <RotateCcw className="h-4 w-4 mr-1" />
                                                            Reopen
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}


