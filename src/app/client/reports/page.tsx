"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Calendar, Clock, TrendingUp } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function ClientReportsPage() {
  const recruiterId = useMemo(()=> (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null), []);
  const [workers, setWorkers] = useState<Array<{id:number,email:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [eods, setEods] = useState<Record<number, any[]>>({});

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
        
        // Get all EOD reports for this recruiter in one efficient call
        const eodRes = await fetch(`${API_BASE}/reports/eod/recruiter?recruiter_id=${id}`, { cache: "no-store" });
        const eodData = await eodRes.json();
        if (eodData?.ok !== false) {
          // Group reports by worker_id
          const reportsByWorker: Record<number, any[]> = {};
          (eodData.items || []).forEach((report: any) => {
            if (!reportsByWorker[report.worker_id]) {
              reportsByWorker[report.worker_id] = [];
            }
            reportsByWorker[report.worker_id].push(report);
          });
          setEods(reportsByWorker);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [recruiterId]);

  const totalReports = Object.values(eods).reduce((sum, reports) => sum + reports.length, 0);
  const workersWithReports = Object.keys(eods).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">EOD Reports</h1>
            <p className="text-slate-600 mt-1">Review daily reports from your team members</p>
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
              <p className="text-xs text-slate-500">Team members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalReports}</div>
              <p className="text-xs text-slate-500">Submitted reports</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Reporters</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{workersWithReports}</div>
              <p className="text-xs text-slate-500">Workers with reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Workers List */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Team Members</CardTitle>
            <CardDescription>Click on a worker to view their detailed reports</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => {
                  const reports = eods[worker.id] || [];
                  const latestReport = reports[0];
                  const reportCount = reports.length;
                  
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
                            {reportCount} reports
                          </Badge>
                        </div>
                        
                        {latestReport ? (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              Latest: {new Date(latestReport.work_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="h-4 w-4" />
                              {latestReport.hours || 0} hours
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2">
                              {latestReport.accomplishments?.slice(0, 100)}...
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 text-center py-4">
                            <FileText className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="text-sm text-slate-500 mt-2">No reports yet</p>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Button 
                            asChild
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                          >
                            <a href={`/client/reports/${worker.id}`}>
                              View Reports
                            </a>
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


