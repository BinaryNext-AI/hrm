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
  Mail, 
  Calendar, 
  UserCheck, 
  UserPlus,
  Trash2,
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

export default function RecruitersPage() {
  const [items, setItems] = useState<Array<{id:number,email:string,role:string,created_at?:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);

  useEffect(() => {
    loadRecruiters();
  }, []);

  async function loadRecruiters() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/recruiters`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok !== false) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function createRecruiter() {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setCreating(true);
    try {
      const params = new URLSearchParams({ email, password });
      const res = await fetch(`${API_BASE}/auth/signup?${params.toString()}`, { method: "POST" });
      const data = await res.json();
      if (data?.ok !== false) {
        setEmail(""); 
        setPassword(""); 
        await loadRecruiters();
        toast.success("Recruiter created successfully!");
      } else {
        toast.error(data?.detail || "Failed to create recruiter");
      }
    } catch (error) {
      toast.error("An error occurred while creating the recruiter");
    } finally {
      setCreating(false);
    }
  }

  async function deleteSelectedRecruiters() {
    if (selectedRecruiters.length === 0) {
      toast.error("Please select at least one recruiter to delete");
      return;
    }

    setDeleting(true);
    try {
      // Find emails for selected recruiter IDs
      const recruitersToDelete = items.filter(recruiter => selectedRecruiters.includes(recruiter.id));
      
      // Delete each selected recruiter
      const deletePromises = recruitersToDelete.map(recruiter =>
        fetch(`${API_BASE}/admin/delete_recruiter?email=${encodeURIComponent(recruiter.email)}`, {
          method: "DELETE",
        }).then(res => res.json())
      );

      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(data => data?.ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} recruiter(s) deleted successfully!`);
        setSelectedRecruiters([]); // Clear selection
        await loadRecruiters(); // Refresh list
      }
      
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} recruiter(s)`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting recruiters");
    } finally {
      setDeleting(false);
    }
  }

  function toggleRecruiterSelection(recruiterId: number) {
    setSelectedRecruiters(prev => 
      prev.includes(recruiterId) 
        ? prev.filter(id => id !== recruiterId)
        : [...prev, recruiterId]
    );
  }

  function toggleSelectAll() {
    if (selectedRecruiters.length === items.length) {
      setSelectedRecruiters([]);
    } else {
      setSelectedRecruiters(items.map(recruiter => recruiter.id));
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2 text-slate-600">Loading recruiters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Recruiters</h1>
        <p className="text-slate-600">Create and manage all recruiters in your system</p>
      </div>

      {/* Stats Card */}
      <Card className="border-0 shadow-lg bg-white mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Total Recruiters</h3>
                <p className="text-3xl font-bold text-blue-600">{items.length}</p>
              </div>
            </div>
            {selectedRecruiters.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  {selectedRecruiters.length} selected
                </Badge>
                <Button
                  onClick={deleteSelectedRecruiters}
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
                      Delete Selected ({selectedRecruiters.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Recruiter Form */}
      <Card className="border-0 shadow-lg bg-white mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Create New Recruiter
          </CardTitle>
          <CardDescription>Add a new recruiter to your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="recruiter@example.com"
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
                onClick={createRecruiter} 
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
                    Create Recruiter
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recruiters List with Selection */}
      {items.length > 0 && (
        <Card className="border-0 shadow-lg bg-white mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                All Recruiters
              </CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedRecruiters.length === items.length && items.length > 0}
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
        {items.map((recruiter) => (
          <Card 
            key={recruiter.id} 
            className={`border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer ${
              selectedRecruiters.includes(recruiter.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleRecruiterSelection(recruiter.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedRecruiters.includes(recruiter.id)}
                    onCheckedChange={() => toggleRecruiterSelection(recruiter.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{recruiter.email}</h3>
                  <p className="text-sm text-slate-600 capitalize">{recruiter.role}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span>ID: {recruiter.id}</span>
                </div>

                {recruiter.created_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {new Date(recruiter.created_at).toLocaleDateString()}</span>
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
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recruiters Yet</h3>
              <p className="text-slate-600">Create your first recruiter using the form above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}