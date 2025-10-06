"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  ArrowRight, 
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function AssignmentsPage() {
  const [workers, setWorkers] = useState<Array<{id:number,email:string}>>([]);
  const [recruiters, setRecruiters] = useState<Array<{id:number,email:string}>>([]);
  const [workerId, setWorkerId] = useState("");
  const [recruiterId, setRecruiterId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [items, setItems] = useState<Array<{id:number,worker_email:string,recruiter_email:string,created_at:string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [w, r, a] = await Promise.all([
        fetch(`${API_BASE}/admin/workers`, { cache: "no-store" }).then(r=>r.json()),
        fetch(`${API_BASE}/admin/recruiters`, { cache: "no-store" }).then(r=>r.json()),
        fetch(`${API_BASE}/admin/assignments`, { cache: "no-store" }).then(r=>r.json())
      ]);
      
      if (w?.ok !== false) setWorkers((w.items || []).map((i:any)=>({id:i.id,email:i.email})));
      if (r?.ok !== false) setRecruiters((r.items || []).map((i:any)=>({id:i.id,email:i.email})));
      if (a?.ok !== false) setItems(a.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function assign() {
    if (!workerId || !recruiterId) {
      toast.error("Please select both worker and recruiter");
      return;
    }
    
    setAssigning(true);
    try {
      const params = new URLSearchParams({ worker_id: workerId, recruiter_id: recruiterId });
      const res = await fetch(`${API_BASE}/admin/assign?${params.toString()}`, { method: "POST" });
      const data = await res.json();
      
      if (data?.ok !== false) {
        toast.success("Worker assigned successfully!");
        setWorkerId("");
        setRecruiterId("");
        await loadData();
      } else {
        toast.error(data?.detail || "Assignment failed");
      }
    } catch (error) {
      toast.error("An error occurred while assigning the worker");
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2 text-slate-600">Loading assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Assignments</h1>
        <p className="text-slate-600">Assign workers to recruiters and manage team relationships</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Workers</p>
                <p className="text-3xl font-bold text-slate-900">{workers.length}</p>
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
                <p className="text-sm text-slate-600">Total Recruiters</p>
                <p className="text-3xl font-bold text-slate-900">{recruiters.length}</p>
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
                <p className="text-sm text-slate-600">Active Assignments</p>
                <p className="text-3xl font-bold text-slate-900">{items.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Assignment Form */}
      <Card className="border-0 shadow-lg bg-white mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            Create New Assignment
          </CardTitle>
          <CardDescription>Assign a worker to a recruiter for task management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Worker</label>
              <Select value={workerId} onValueChange={setWorkerId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id.toString()}>
                      {worker.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Recruiter</label>
              <Select value={recruiterId} onValueChange={setRecruiterId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {recruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                      {recruiter.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">&nbsp;</label>
              <Button 
                onClick={assign} 
                disabled={assigning || !workerId || !recruiterId}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Create Assignment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Assignments */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Current Assignments
          </CardTitle>
          <CardDescription>All active worker-recruiter assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{assignment.worker_email}</h3>
                      <p className="text-sm text-slate-600">Worker</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{assignment.recruiter_email}</h3>
                      <p className="text-sm text-slate-600">Recruiter</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(assignment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assignments Yet</h3>
              <p className="text-slate-600">Create your first assignment using the form above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


