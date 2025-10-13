"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Trash2, 
  UserCheck, 
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function WorkersPage() {
  const [items, setItems] = useState<Array<{id:number,email:string,role:string,created_at?:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/workers`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok !== false) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createWorker() {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setCreating(true);
    try {
      const params = new URLSearchParams({ email, password });
      const res = await fetch(`${API_BASE}/admin/workers?${params.toString()}`, { method: "POST" });
      const data = await res.json();
      if (data?.ok !== false) {
        setEmail(""); 
        setPassword(""); 
        await load();
        toast.success("Worker created successfully!");
      } else {
        toast.error(data?.detail || "Failed to create worker");
      }
    } catch (error) {
      toast.error("An error occurred while creating the worker");
    } finally {
      setCreating(false);
    }
  }
  
  async function deleteSelectedWorkers() {
    if (selectedWorkers.length === 0) {
      toast.error("Please select at least one worker to delete");
      return;
    }

    setDeleting(true);
    try {
      // Find emails for selected worker IDs
      const workersToDelete = items.filter(worker => selectedWorkers.includes(worker.id));
      
      // Delete each selected worker
      const deletePromises = workersToDelete.map(worker =>
        fetch(`${API_BASE}/admin/delete_worker?email=${encodeURIComponent(worker.email)}`, {
          method: "DELETE",
        }).then(res => res.json())
      );

      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(data => data?.ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} worker(s) deleted successfully!`);
        setSelectedWorkers([]); // Clear selection
        await load(); // Refresh list
      }
      
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} worker(s)`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting workers");
    } finally {
      setDeleting(false);
    }
  }

  function toggleWorkerSelection(workerId: number) {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  }

  function toggleSelectAll() {
    if (selectedWorkers.length === items.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(items.map(worker => worker.id));
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2 text-slate-600">Loading workers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Workers</h1>
        <p className="text-slate-600">Create and manage all workers in your system</p>
      </div>

      {/* Stats Card */}
      <Card className="border-0 shadow-lg bg-white mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Total Workers</h3>
                <p className="text-3xl font-bold text-green-600">{items.length}</p>
              </div>
            </div>
            {selectedWorkers.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  {selectedWorkers.length} selected
                </Badge>
                <Button
                  onClick={deleteSelectedWorkers}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedWorkers.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Worker Form */}
      <Card className="border-0 shadow-lg bg-white mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Create New Worker
          </CardTitle>
          <CardDescription>Add a new worker to your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="worker@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={createWorker} 
                disabled={creating || !email || !password}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Worker
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List with Selection */}
      {items.length > 0 && (
        <Card className="border-0 shadow-lg bg-white mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                All Workers
              </CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedWorkers.length === items.length && items.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <Label htmlFor="select-all" className="cursor-pointer text-sm font-normal">
                  Select All
                </Label>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((worker) => (
          <Card 
            key={worker.id} 
            className={`border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer ${
              selectedWorkers.includes(worker.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleWorkerSelection(worker.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedWorkers.includes(worker.id)}
                    onCheckedChange={() => toggleWorkerSelection(worker.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{worker.email}</h3>
                  <p className="text-sm text-slate-600 capitalize">{worker.role}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span>ID: {worker.id}</span>
                </div>

                {worker.created_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {new Date(worker.created_at).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && !loading && (
          <Card className="col-span-full border-0 shadow-lg bg-white">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Workers Yet</h3>
              <p className="text-slate-600">Create your first worker using the form above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}