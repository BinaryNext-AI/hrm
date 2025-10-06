"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, PlayCircle, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ManageWorkerPage() {
  const params = useParams();
  const workerId = useMemo(() => Number(params?.id), [params]);
  const [tasks, setTasks] = useState<Array<{id:number,title:string,description:string|null,priority:string,due_date:string|null,created_at:string,status:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks?worker_id=${workerId}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok !== false) setTasks(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!workerId) return;
    load();
  }, [workerId]);

  async function createTask() {
    if (!title || !workerId) return;
    setSaving(true);
    try {
      const recruiterId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      const params = new URLSearchParams({
        recruiter_id: String(recruiterId || ''),
        worker_id: String(workerId),
        title,
        description: desc,
        priority,
        due_date: due || ''
      });
      const res = await fetch(`${API_BASE}/tasks?${params.toString()}`, { method: 'POST' });
      const data = await res.json();
      if (data?.ok !== false) {
        setTitle(''); setDesc(''); setPriority('medium'); setDue('');
        await load();
      } else {
        alert(data?.detail || 'Failed to create task');
      }
    } finally {
      setSaving(false);
    }
  }

  // Categorize tasks by status
  const pendingTasks = tasks.filter(t => (t.status || 'todo') === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'done');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-slate-600 mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Worker #{workerId}</h1>
            <p className="text-slate-600 mt-1">Assign and track tasks for this team member</p>
          </div>
          <LogoutButton />
        </div>

        {/* Task Creation Form */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Assign New Task
            </CardTitle>
            <CardDescription>Create a new task for this worker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter task description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input
                  id="due"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={createTask} 
                  disabled={saving || !title}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {saving ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Pending ({pendingTasks.length})
              </CardTitle>
              <CardDescription>Tasks waiting to be started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No pending tasks</p>
                </div>
              ) : (
                pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>

          {/* In Progress Tasks */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <PlayCircle className="h-5 w-5" />
                In Progress ({inProgressTasks.length})
              </CardTitle>
              <CardDescription>Tasks currently being worked on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                </div>
              ) : inProgressTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <PlayCircle className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No tasks in progress</p>
                </div>
              ) : (
                inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Completed ({completedTasks.length})
              </CardTitle>
              <CardDescription>Finished tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                </div>
              ) : completedTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No completed tasks</p>
                </div>
              ) : (
                completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


