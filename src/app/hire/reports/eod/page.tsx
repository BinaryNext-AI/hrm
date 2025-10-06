"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function EodReportPage() {
  const [accomplishments, setAccomplishments] = useState("");
  const [challenges, setChallenges] = useState("");
  const [blockers, setBlockers] = useState("");
  const [hours, setHours] = useState("8");
  const [nextPlan, setNextPlan] = useState("");
  const [learned, setLearned] = useState("");
  const [helpNeeded, setHelpNeeded] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const workerId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!workerId) return;
    if (!accomplishments) { toast.error("Please add your accomplishments for the day"); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        worker_id: String(workerId),
        accomplishments,
        challenges,
        blockers,
        hours: hours || "0",
        next_day_plan: nextPlan,
      });
      const res = await fetch(`${API_BASE}/reports/eod?${params.toString()}`, { method: 'POST' });
      const data = await res.json();
      if (data?.ok !== false) {
        toast.success("End of day report submitted");
        setAccomplishments(""); setChallenges(""); setBlockers(""); setHours("8"); setNextPlan("");
      } else {
        toast.error(data?.detail || "Failed to submit report");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">End of Day Report</h1>
      <p className="text-sm text-gray-600 mt-1">Please complete this report after finishing your daily tasks.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 max-w-3xl">
        <div>
          <Label className="text-sm">What did you accomplish today?</Label>
          <textarea value={accomplishments} onChange={(e)=>setAccomplishments(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={4} placeholder="List key tasks, milestones, and deliverables." />
        </div>
        <div>
          <Label className="text-sm">Any challenges you faced?</Label>
          <textarea value={challenges} onChange={(e)=>setChallenges(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} placeholder="Briefly describe any issues or blockers." />
        </div>
        <div>
          <Label className="text-sm">Blockers</Label>
          <textarea value={blockers} onChange={(e)=>setBlockers(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="Anything that needs help?" />
        </div>
        <div>
          <Label className="text-sm">What did you learn today?</Label>
          <textarea value={learned} onChange={(e)=>setLearned(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="New insights, tools, or processes." />
        </div>
        <div>
          <Label className="text-sm">Where do you need help?</Label>
          <textarea value={helpNeeded} onChange={(e)=>setHelpNeeded(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="Call out any support needed from the team." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Hours worked</Label>
            <Input type="number" min={0} max={24} value={hours} onChange={(e)=>setHours(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Plan for tomorrow</Label>
            <Input value={nextPlan} onChange={(e)=>setNextPlan(e.target.value)} className="mt-1" placeholder="Top priorities for next day" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={loading} onClick={submit}>{loading ? 'Submitting...' : 'Submit report'}</Button>
        </div>
      </div>
    </div>
  );
}


