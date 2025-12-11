"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Clock, Activity, MousePointer, Keyboard, Calendar, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TimeChart } from "@/components/charts/TimeChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { CompletionChart } from "@/components/charts/CompletionChart";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function WorkerAnalyticsPage() {
  const params = useParams();
  const workerId = useMemo(()=> Number(params?.id), [params]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [workerEmail, setWorkerEmail] = useState("");

  useEffect(() => {
    if (!workerId) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/analytics/time/detailed?worker_id=${workerId}&days=30`, { cache: "no-store" });
        const data = await res.json();
        if (data?.ok !== false) {
          setAnalytics(data.data);
          // Get worker email from the first task if available
          if (data.data?.task_breakdown?.[0]) {
            setWorkerEmail(`Worker #${workerId}`);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [workerId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals
  const totalGlobalTime = analytics?.daily_global?.reduce((sum: number, day: any) => sum + (day.total_seconds || 0), 0) || 0;
  const totalTaskTime = analytics?.daily_task?.reduce((sum: number, day: any) => sum + (day.total_seconds || 0), 0) || 0;
  const totalKeystrokes = analytics?.daily_task?.reduce((sum: number, day: any) => sum + (day.total_keystrokes || 0), 0) || 0;
  const totalMouseClicks = analytics?.daily_task?.reduce((sum: number, day: any) => sum + (day.total_mouse_clicks || 0), 0) || 0;
  const totalMouseMoves = analytics?.daily_task?.reduce((sum: number, day: any) => sum + (day.total_mouse_moves || 0), 0) || 0;
  const totalSessions = analytics?.recent_sessions?.length || 0;
  
  // Work completion data
  const workSummary = analytics?.work_summary || {};
  const completionRate = workSummary.completion_rate || 0;
  const completedDays = workSummary.completed_days || 0;
  const partialDays = workSummary.partial_days || 0;
  const insufficientDays = workSummary.insufficient_days || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/client/analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Detailed Analytics</h1>
              <p className="text-slate-600 mt-1">Time tracking insights for {workerEmail}</p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Global Time</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatTime(totalGlobalTime)}</div>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Task Time</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatTime(totalTaskTime)}</div>
              <p className="text-xs text-slate-500">Active work time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalSessions}</div>
              <p className="text-xs text-slate-500">Work sessions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Activity Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalKeystrokes + totalMouseClicks + totalMouseMoves}
              </div>
              <p className="text-xs text-slate-500">Total interactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Work Completion Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">8-Hour Work Completion</CardTitle>
              <CardDescription>Daily work completion status over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedDays}</div>
                  <p className="text-sm text-slate-500 mt-1">Completed Days</p>
                  <p className="text-xs text-slate-400">8+ hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{partialDays}</div>
                  <p className="text-sm text-slate-500 mt-1">Partial Days</p>
                  <p className="text-xs text-slate-400">6-8 hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{insufficientDays}</div>
                  <p className="text-sm text-slate-500 mt-1">Insufficient Days</p>
                  <p className="text-xs text-slate-400">&lt;6 hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
                  <p className="text-sm text-slate-500 mt-1">Completion Rate</p>
                  <p className="text-xs text-slate-400">8-hour days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">Work Completion Distribution</CardTitle>
              <CardDescription>Visual breakdown of work completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <CompletionChart 
                  completedDays={completedDays}
                  partialDays={partialDays}
                  insufficientDays={insufficientDays}
                  title=""
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-blue-600" />
                Keystrokes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalKeystrokes.toLocaleString()}</div>
              <p className="text-sm text-slate-500 mt-1">Total keystrokes tracked</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-green-600" />
                Mouse Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalMouseClicks.toLocaleString()}</div>
              <p className="text-sm text-slate-500 mt-1">Total mouse clicks</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Mouse Moves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalMouseMoves.toLocaleString()}</div>
              <p className="text-sm text-slate-500 mt-1">Total mouse movements</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Breakdown */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Task Performance</CardTitle>
            <CardDescription>Time spent and activity for each task</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading task data...</span>
              </div>
            ) : !analytics?.task_breakdown?.length ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No task data</h3>
                <p className="mt-1 text-sm text-slate-500">This worker hasn't tracked time on any tasks yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-slate-700">Task</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Time Spent</TableHead>
                    <TableHead className="font-semibold text-slate-700">Sessions</TableHead>
                    <TableHead className="font-semibold text-slate-700">Keystrokes</TableHead>
                    <TableHead className="font-semibold text-slate-700">Mouse Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.task_breakdown.map((task: any) => (
                    <TableRow key={task.task_id} className="border-slate-100 hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {task.task_title || `Task #${task.task_id}`}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            task.task_status === 'done' ? 'bg-green-100 text-green-800 border-green-200' :
                            task.task_status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          {task.task_status?.replace('_', ' ') || 'todo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="font-mono">{formatTime(task.total_seconds || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">{task.session_count || 0}</TableCell>
                      <TableCell className="text-slate-700">{(task.total_keystrokes || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-slate-700">{(task.total_mouse_clicks || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Time Trends Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Daily Time Trends</CardTitle>
            <CardDescription>Track daily work hours against 8-hour target over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading chart...</span>
              </div>
            ) : !analytics?.daily_global?.length ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No time data</h3>
                <p className="mt-1 text-sm text-slate-500">No time tracking data available for the last 30 days.</p>
              </div>
            ) : (
              <div className="h-80">
                <TimeChart 
                  data={analytics.daily_global}
                  title=""
                  type="line"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Patterns Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Daily Activity Patterns</CardTitle>
            <CardDescription>Keystrokes, mouse clicks, and movements over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading chart...</span>
              </div>
            ) : !analytics?.daily_task?.length ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No activity data</h3>
                <p className="mt-1 text-sm text-slate-500">No activity tracking data available for the last 30 days.</p>
              </div>
            ) : (
              <div className="h-80">
                <ActivityChart 
                  data={analytics.daily_task}
                  title=""
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Activity List */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Daily Activity Details</CardTitle>
            <CardDescription>Detailed breakdown of work time and activity for each day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading daily data...</span>
              </div>
            ) : !analytics?.daily_global?.length ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No daily data</h3>
                <p className="mt-1 text-sm text-slate-500">No activity recorded in the last 30 days.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.daily_global.slice(0, 10).map((day: any, index: number) => {
                  const workStatus = day.work_status || 'insufficient';
                  const statusColor = workStatus === 'completed' ? 'green' : workStatus === 'partial' ? 'yellow' : 'red';
                  const statusBg = workStatus === 'completed' ? 'bg-green-100' : workStatus === 'partial' ? 'bg-yellow-100' : 'bg-red-100';
                  const statusText = workStatus === 'completed' ? 'Completed' : workStatus === 'partial' ? 'Partial' : 'Insufficient';
                  
                  return (
                    <div key={day.work_date} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`h-10 w-10 rounded-full ${statusBg} flex items-center justify-center`}>
                          <Calendar className={`h-5 w-5 text-${statusColor}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{formatDate(day.work_date)}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-500">{day.session_count || 0} sessions</p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                workStatus === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                workStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {statusText}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">{formatTime(day.total_seconds || 0)}</div>
                          <div className="text-xs text-slate-500">Total Time</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">
                            {Math.round((day.total_seconds || 0) / 3600 * 10) / 10}h
                          </div>
                          <div className="text-xs text-slate-500">Hours</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            workStatus === 'completed' ? 'text-green-600' :
                            workStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {workStatus === 'completed' ? '✓' : workStatus === 'partial' ? '⚠' : '✗'}
                          </div>
                          <div className="text-xs text-slate-500">Status</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Sessions</CardTitle>
            <CardDescription>Latest work sessions with detailed activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading sessions...</span>
              </div>
            ) : !analytics?.recent_sessions?.length ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No sessions</h3>
                <p className="mt-1 text-sm text-slate-500">No work sessions recorded yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-slate-700">Task</TableHead>
                    <TableHead className="font-semibold text-slate-700">Start Time</TableHead>
                    <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                    <TableHead className="font-semibold text-slate-700">Keystrokes</TableHead>
                    <TableHead className="font-semibold text-slate-700">Mouse Clicks</TableHead>
                    <TableHead className="font-semibold text-slate-700">Mouse Moves</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recent_sessions.map((session: any) => (
                    <TableRow key={session.id} className="border-slate-100 hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {session.task_title || 'No Task'}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatDateTime(session.start_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="font-mono">{formatTime(session.duration_seconds || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">{(session.keystrokes || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-slate-700">{(session.mouse_clicks || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-slate-700">{(session.mouse_moves || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
