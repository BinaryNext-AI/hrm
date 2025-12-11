"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, FileText, Target, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function WorkerReportsPage() {
  const params = useParams();
  const workerId = useMemo(()=> Number(params?.id), [params]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [workerEmail, setWorkerEmail] = useState("");

  useEffect(() => {
    if (!workerId) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/reports/eod?worker_id=${workerId}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.ok !== false) {
          setReports(data.items || []);
          // Get worker email from the first report or make a separate call
          if (data.items && data.items.length > 0) {
            // We could add worker email to the report data, but for now we'll use worker ID
            setWorkerEmail(`Worker #${workerId}`);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [workerId]);

  const totalHours = reports.reduce((sum, report) => sum + (report.hours || 0), 0);
  const totalReports = reports.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/client/reports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">EOD Reports</h1>
              <p className="text-slate-600 mt-1">Daily reports from {workerEmail}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalHours}</div>
              <p className="text-xs text-slate-500">Hours reported</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Hours</CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalReports > 0 ? Math.round((totalHours / totalReports) * 10) / 10 : 0}
              </div>
              <p className="text-xs text-slate-500">Hours per report</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Daily Reports</CardTitle>
            <CardDescription>Chronological list of all submitted reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No reports yet</h3>
                <p className="mt-1 text-sm text-slate-500">This worker hasn't submitted any reports.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report, index) => (
                  <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {new Date(report.work_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardTitle>
                            <CardDescription>
                              Submitted on {new Date(report.submitted_at).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {report.hours || 0}h
                          </Badge>
                          <Badge variant="outline">
                            Report #{totalReports - index}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Accomplishments */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-slate-900">Accomplishments</h3>
                        </div>
                        <p className="text-slate-700 bg-green-50 p-4 rounded-lg border border-green-200">
                          {report.accomplishments || 'No accomplishments reported'}
                        </p>
                      </div>

                      {/* Challenges */}
                      {report.challenges && (
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h3 className="font-semibold text-slate-900">Challenges</h3>
                          </div>
                          <p className="text-slate-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            {report.challenges}
                          </p>
                        </div>
                      )}

                      {/* Blockers */}
                      {report.blockers && (
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h3 className="font-semibold text-slate-900">Blockers</h3>
                          </div>
                          <p className="text-slate-700 bg-red-50 p-4 rounded-lg border border-red-200">
                            {report.blockers}
                          </p>
                        </div>
                      )}

                      {/* Next Day Plan */}
                      {report.next_day_plan && (
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <Target className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-900">Next Day Plan</h3>
                          </div>
                          <p className="text-slate-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            {report.next_day_plan}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


