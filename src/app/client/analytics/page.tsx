"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, Activity, TrendingUp, BarChart3 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { WorkerComparisonChart } from "@/components/charts/WorkerComparisonChart";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function TimeAnalyticsPage() {
  const recruiterId = useMemo(()=> (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null), []);
  const [workers, setWorkers] = useState<Array<{id:number,email:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [timeByWorker, setTimeByWorker] = useState<Record<number, any>>({});

  useEffect(() => {
    const id = recruiterId;
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        // Get workers list
        const params = new URLSearchParams({ recruiter_id: String(id) });
        const res = await fetch(`${API_BASE}/recruiter/workers?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        const items: Array<{id:number,email:string}> = data?.items || [];
        setWorkers(items);
        
        // Get time summaries for all workers
        await Promise.all(items.map(async (w) => {
          try {
            const timeRes = await fetch(`${API_BASE}/time/task/summary?worker_id=${w.id}`, { cache: "no-store" });
            const timeData = await timeRes.json();
            if (timeData?.ok !== false && timeData?.item) {
              setTimeByWorker(prev => ({ 
                ...prev, 
                [w.id]: {
                  total_seconds: timeData.item.total_seconds || 0,
                  per_task: timeData.item.per_task || [],
                  session_count: timeData.item.per_task?.length || 0
                }
              }));
            }
          } catch {}
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, [recruiterId]);

  const totalWorkers = workers.length;
  const totalTimeSeconds = Object.values(timeByWorker).reduce((sum, worker) => sum + (worker.total_seconds || 0), 0);
  const totalHours = Math.floor(totalTimeSeconds / 3600);
  const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const activeWorkers = Object.values(timeByWorker).filter(worker => (worker.total_seconds || 0) > 0).length;
  const avgTimePerWorker = totalWorkers > 0 ? Math.round(totalTimeSeconds / totalWorkers / 3600 * 10) / 10 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Time Analytics</h1>
            <p className="text-slate-600 mt-1">Detailed time tracking and productivity insights for your team</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Workers</CardTitle>
              <User className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalWorkers}</div>
              <p className="text-xs text-slate-500">Team members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalHours.toString().padStart(2, '0')}:{totalMinutes.toString().padStart(2, '0')}h
              </div>
              <p className="text-xs text-slate-500">Across all workers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Workers</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activeWorkers}</div>
              <p className="text-xs text-slate-500">With time tracked</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Time/Worker</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{avgTimePerWorker}h</div>
              <p className="text-xs text-slate-500">Average per worker</p>
            </CardContent>
          </Card>
        </div>

        {/* Worker Comparison Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Worker Performance Comparison</CardTitle>
            <CardDescription>Compare total hours worked across all team members</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading chart...</span>
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No data available</h3>
                <p className="mt-1 text-sm text-slate-500">No workers assigned to generate comparison chart.</p>
              </div>
            ) : (
              <div className="h-80">
                <WorkerComparisonChart 
                  workers={workers.map(w => ({
                    id: w.id,
                    email: w.email,
                    total_seconds: timeByWorker[w.id]?.total_seconds || 0,
                    session_count: timeByWorker[w.id]?.session_count || 0
                  }))}
                  title="Total Hours Worked by Worker"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workers Analytics List */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Worker Analytics</CardTitle>
            <CardDescription>Click on any worker to view detailed time analytics and charts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading analytics...</span>
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No workers assigned</h3>
                <p className="mt-1 text-sm text-slate-500">Contact admin to assign workers to your team.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => {
                  const workerData = timeByWorker[worker.id] || { total_seconds: 0, session_count: 0, per_task: [] };
                  const time = workerData.total_seconds || 0;
                  const hours = Math.floor(time / 3600);
                  const minutes = Math.floor((time % 3600) / 60);
                  const seconds = Math.floor(time % 60);
                  const sessionCount = workerData.session_count || 0;
                  
                  return (
                    <Card key={worker.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{worker.email}</h3>
                              <p className="text-sm text-slate-500">Team Member</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {sessionCount} sessions
                          </Badge>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Total Time</span>
                            <div className="flex items-center gap-1 text-sm font-mono text-slate-700">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span>
                                {hours.toString().padStart(2,'0')}:{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Tasks Tracked</span>
                            <span className="text-sm font-medium text-slate-700">
                              {workerData.per_task?.length || 0}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Daily Target</span>
                            <Badge 
                              variant="outline" 
                              className={
                                time >= 28800 ? "bg-green-100 text-green-800 border-green-200" :
                                time >= 21600 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                time > 0 ? "bg-red-100 text-red-800 border-red-200" :
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {time >= 28800 ? "8h+ Complete" :
                               time >= 21600 ? "6-8h Partial" :
                               time > 0 ? "<6h Insufficient" :
                               "No Activity"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            asChild
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                          >
                            <Link href={`/client/analytics/${worker.id}`}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Detailed Analytics
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
