"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HelpCircle, Send, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function SupportPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: "",
        subject: "",
        description: "",
        priority: "medium"
    });

    const categories = [
        { value: "time_tracking", label: "Time Tracking Issues", description: "Forgot to log time, timer problems, and other time-related issues" },
        { value: "attendance", label: "Attendance Issues", description: "Forgot to check in/out, attendance problems" },
        { value: "task_tracking", label: "Task Tracking Issues", description: "Can't start task tracking, tracking problems" },
        { value: "technical", label: "Technical Issues", description: "Login problems, page errors, bugs" },
        { value: "general", label: "General Support", description: "Other questions or concerns" }
    ];

    const priorities = [
        { value: "low", label: "Low", color: "text-green-600" },
        { value: "medium", label: "Medium", color: "text-yellow-600" },
        { value: "high", label: "High", color: "text-red-600" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const workerId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
            if (!workerId) {
                toast.error("Please log in to submit a support ticket");
                return;
            }

            const params = new URLSearchParams({
                worker_id: workerId,
                category: formData.category,
                subject: formData.subject,
                description: formData.description,
                priority: formData.priority
            });

            const response = await fetch(`${API_BASE}/support/tickets?${params.toString()}`, {
                method: 'POST'
            });

            const result = await response.json();

            if (result.ok !== false) {
                toast.success("Support ticket submitted successfully!");
                setFormData({
                    category: "",
                    subject: "",
                    description: "",
                    priority: "medium"
                });
            } else {
                toast.error(result.message || "Failed to submit support ticket");
            }
        } catch (error) {
            toast.error("An error occurred while submitting your ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Center</h1>
                    <p className="text-slate-600">Get help with any issues you're experiencing</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Support Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-blue-600" />
                                    Submit Support Ticket
                                </CardTitle>
                                <CardDescription>
                                    Describe your issue and we'll get back to you as soon as possible
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Category Selection */}
                                    <div className="space-y-3">
                                        <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                                            Issue Category *
                                        </Label>
                                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                            <SelectTrigger className="w-full text-left h-14">
                                                <SelectValue placeholder="Select the type of issue you're experiencing" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.value} value={category.value} className="text-left py-3">
                                                        <span className="font-medium text-left">{category.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Priority Selection */}
                                    <div className="space-y-3">
                                        <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
                                            Priority Level
                                        </Label>
                                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                                            <SelectTrigger className="w-full text-left h-14">
                                                <SelectValue placeholder="Select priority level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorities.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value} className="text-left py-4">
                                                        <span className={`${priority.color} text-left`}>{priority.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-3">
                                        <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                                            Subject *
                                        </Label>
                                        <Input
                                            id="subject"
                                            type="text"
                                            placeholder="Brief description of your issue"
                                            value={formData.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            required
                                            className="w-full h-14"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                                            Detailed Description *
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Please provide as much detail as possible about your issue. Include steps to reproduce the problem (if any)."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            required
                                            rows={8}
                                            className="w-full resize-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={loading || !formData.category || !formData.subject || !formData.description}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Submit Support Ticket
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Help Information */}
                    <div className="space-y-6">
                        {/* Common Issues */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Common Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-1">Forgot to Check In</h4>
                                    <p className="text-sm text-yellow-700">If you forgot to check in but worked, submit a ticket with your actual work hours.</p>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-1">Timer Issues</h4>
                                    <p className="text-sm text-blue-700">If the global timer or task tracking isn't working properly.</p>
                                </div>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-1">Task Problems</h4>
                                    <p className="text-sm text-green-700">Can't start task tracking or tasks not updating correctly.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Response Time */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Response Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">High Priority Tickets</span>
                                        <span className="text-sm font-medium text-red-600">Within 2 hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Medium Priority Tickets</span>
                                        <span className="text-sm font-medium text-yellow-600">Within 24 hours</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Low Priority Tickets</span>
                                        <span className="text-sm font-medium text-green-600">Within 48 hours</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Tips for Better Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Be specific about what you were trying to do
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Include any error messages you see
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Mention your browser and device type
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        Provide exact times if reporting time tracking issues
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
