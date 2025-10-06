"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
    MessageSquare, 
    Clock, 
    User, 
    AlertTriangle, 
    CheckCircle, 
    XCircle, 
    Play,
    Calendar,
    Mail,
    Tag,
    Send,
    Shield,
    Reply
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface SupportTicket {
    id: number;
    worker_id: number;
    worker_email: string;
    worker_role: string;
    category: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    admin_response: string | null;
    created_at: string;
    updated_at: string;
}

interface ConversationMessage {
    id: number;
    sender_id: number;
    sender_role: string;
    message: string;
    created_at: string;
    sender_email: string;
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [responseText, setResponseText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);

    const loadTickets = async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/support/tickets`, {
                cache: "no-store"
            });
            const result = await response.json();
            if (result.ok !== false) {
                setTickets(result.tickets || []);
            }
        } catch (error) {
            console.error("Error loading tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
        try {
            const response = await fetch(`${API_BASE}/admin/support/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ status: newStatus })
            });
            
            const result = await response.json();
            if (result.ok !== false) {
                toast.success(`Ticket status updated to ${newStatus}`);
                loadTickets();
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket({ ...selectedTicket, status: newStatus });
                }
            } else {
                toast.error("Failed to update ticket status");
            }
        } catch (error) {
            toast.error("Error updating ticket status");
        }
    };

    const handleResponseSubmit = async (ticketId: number) => {
        if (!responseText.trim()) {
            toast.error("Please enter a response");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/admin/support/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ admin_response: responseText })
            });
            
            const result = await response.json();
            if (result.ok !== false) {
                toast.success("Response sent successfully");
                setResponseText("");
                loadTickets();
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket({ ...selectedTicket, admin_response: responseText });
                }
            } else {
                toast.error("Failed to send response");
            }
        } catch (error) {
            toast.error("Error sending response");
        }
    };

    const loadConversationMessages = async (ticketId: number) => {
        try {
            const response = await fetch(`${API_BASE}/support/conversations/${ticketId}`, {
                cache: "no-store"
            });
            const result = await response.json();
            if (result.ok !== false) {
                setConversationMessages(result.messages || []);
            }
        } catch (error) {
            console.error("Error loading conversation messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;
        
        setSendingMessage(true);
        try {
            // For admin, we'll use a hardcoded admin ID (1) since we don't have admin login yet
            const adminId = 1;

            const params = new URLSearchParams({
                ticket_id: selectedTicket.id.toString(),
                sender_id: adminId.toString(),
                sender_role: 'admin',
                message: newMessage.trim()
            });

            const response = await fetch(`${API_BASE}/support/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            const result = await response.json();
            if (result.ok !== false) {
                setNewMessage("");
                await loadConversationMessages(selectedTicket.id);
                toast.success("Message sent successfully!");
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            toast.error("Error sending message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleTicketSelect = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        loadConversationMessages(ticket.id);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'time_tracking': return <Clock className="h-4 w-4" />;
            case 'attendance': return <User className="h-4 w-4" />;
            case 'task_tracking': return <Play className="h-4 w-4" />;
            case 'technical': return <AlertTriangle className="h-4 w-4" />;
            case 'general': return <MessageSquare className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
        const priorityMatch = priorityFilter === "all" || ticket.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        high: tickets.filter(t => t.priority === 'high').length,
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <span className="ml-2 text-slate-600">Loading support tickets...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Tickets</h1>
                <p className="text-slate-600">Manage and respond to worker support requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Tickets</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Open</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                            </div>
                            <Play className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">High Priority</p>
                                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Support Tickets</CardTitle>
                                    <CardDescription>Click on a ticket to view details and respond</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priority</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">No support tickets</h3>
                                        <p className="mt-1 text-sm text-slate-500">No tickets match your current filters.</p>
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedTicket?.id === ticket.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                            onClick={() => handleTicketSelect(ticket)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getCategoryIcon(ticket.category)}
                                                        <h4 className="font-medium text-slate-900">{ticket.subject}</h4>
                                                        <Badge className={getPriorityColor(ticket.priority)}>
                                                            {ticket.priority}
                                                        </Badge>
                                                        <Badge className={getStatusColor(ticket.status)}>
                                                            {ticket.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            {ticket.worker_email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(ticket.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Conversation Thread */}
                <div>
                    {selectedTicket ? (
                        <Card className="border-0 shadow-lg bg-white h-[600px] flex flex-col">
                            <CardHeader className="border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5 text-blue-600" />
                                            Ticket #{selectedTicket.id}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedTicket.worker_email} • {new Date(selectedTicket.created_at).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={getPriorityColor(selectedTicket.priority)}>
                                            {selectedTicket.priority}
                                        </Badge>
                                        <Badge className={getStatusColor(selectedTicket.status)}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {/* Status Actions */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-slate-900 mb-2">Update Status</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                            <Button
                                                key={status}
                                                variant={selectedTicket.status === status ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleStatusUpdate(selectedTicket.id, status)}
                                                className="capitalize text-xs"
                                            >
                                                {status.replace('_', ' ')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-1 flex flex-col p-0">
                                {/* Original Ticket Description */}
                                <div className="p-4 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-slate-900">{selectedTicket.worker_email}</span>
                                                <span className="text-xs text-slate-500">(Worker)</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(selectedTicket.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-700">
                                                <div className="font-medium mb-1">{selectedTicket.subject}</div>
                                                <div className="whitespace-pre-wrap">{selectedTicket.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversation Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {conversationMessages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="mx-auto h-8 w-8 text-slate-400" />
                                            <p className="text-sm text-slate-500 mt-2">No conversation yet</p>
                                        </div>
                                    ) : (
                                        conversationMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex gap-3 ${
                                                    message.sender_role === 'admin' ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                {message.sender_role === 'worker' && (
                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <User className="h-4 w-4 text-green-600" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                                        message.sender_role === 'admin'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-100 text-slate-900'
                                                    }`}
                                                >
                                                    <div className="text-sm">{message.message}</div>
                                                    <div
                                                        className={`text-xs mt-1 ${
                                                            message.sender_role === 'admin'
                                                                ? 'text-blue-100'
                                                                : 'text-slate-500'
                                                        }`}
                                                    >
                                                        {message.sender_role === 'admin' ? (
                                                            <div className="flex items-center gap-1">
                                                                <Shield className="h-3 w-3" />
                                                                Admin
                                                            </div>
                                                        ) : (
                                                            message.sender_email
                                                        )}
                                                        <span className="ml-2">
                                                            {new Date(message.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {message.sender_role === 'admin' && (
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <Shield className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Reply Form */}
                                <div className="border-t border-slate-200 p-4">
                                    <div className="flex gap-2">
                                        <Textarea
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={2}
                                            className="flex-1 resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="px-4"
                                        >
                                            {sendingMessage ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-lg bg-white h-[600px]">
                            <CardContent className="p-8 h-full flex items-center justify-center">
                                <div className="text-center">
                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">Select a ticket</h3>
                                    <p className="mt-1 text-sm text-slate-500">Choose a ticket from the list to view conversation.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
