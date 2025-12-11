"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
    MessageSquare, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    XCircle, 
    Play,
    Calendar,
    Tag,
    Plus,
    User,
    Shield,
    Reply,
    Send
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://hrm-be-0h9z.onrender.com";

interface SupportTicket {
    id: number;
    worker_id: number;
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

export default function WorkerTicketsPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);

    const loadTickets = async () => {
        try {
            const workerId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
            if (!workerId) {
                setTickets([]);
                return;
            }

            const response = await fetch(`${API_BASE}/support/tickets/worker?worker_id=${workerId}`, {
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
            const workerId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
            if (!workerId) return;

            const params = new URLSearchParams({
                ticket_id: selectedTicket.id.toString(),
                sender_id: workerId,
                sender_role: 'worker',
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
            case 'attendance': return <AlertTriangle className="h-4 w-4" />;
            case 'task_tracking': return <Play className="h-4 w-4" />;
            case 'technical': return <AlertTriangle className="h-4 w-4" />;
            case 'general': return <MessageSquare className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const formatCategory = (category: string) => {
        return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        withResponse: tickets.filter(t => t.admin_response).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                        <span className="ml-2 text-slate-600">Loading your support tickets...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Support Tickets</h1>
                            <p className="text-slate-600">View and track your submitted support requests</p>
                        </div>
                        <Link href="/hire/support">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                New Ticket
                            </Button>
                        </Link>
                    </div>
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
                                    <p className="text-sm text-slate-600">With Response</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.withResponse}</p>
                                </div>
                                <Reply className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tickets List */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle>Your Support Tickets</CardTitle>
                            <CardDescription>Click on a ticket to view conversation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tickets.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">No support tickets</h3>
                                    <p className="mt-1 text-sm text-slate-500">You haven't submitted any support tickets yet.</p>
                                    <div className="mt-4">
                                        <Link href="/hire/support">
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Submit Your First Ticket
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
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
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(ticket.created_at).toLocaleDateString()}
                                                        </div>
                                                        {conversationMessages.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <MessageSquare className="h-4 w-4" />
                                                                {conversationMessages.length} messages
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Conversation Thread */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle>Conversation</CardTitle>
                            <CardDescription>
                                {selectedTicket ? `Ticket #${selectedTicket.id}: ${selectedTicket.subject}` : "Select a ticket to view conversation"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedTicket ? (
                                <div className="space-y-4">
                                    {/* Original Ticket Description */}
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-slate-600" />
                                            <span className="text-sm font-medium text-slate-700">Original Issue</span>
                                        </div>
                                        <p className="text-sm text-slate-600">{selectedTicket.description}</p>
                                        <div className="mt-2 text-xs text-slate-500">
                                            {new Date(selectedTicket.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Conversation Messages */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {conversationMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender_role === 'worker' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.sender_role === 'worker'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-green-100 text-slate-800 border border-green-200'
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                                    <div className={`text-xs mt-1 ${
                                                        message.sender_role === 'worker' ? 'text-blue-100' : 'text-slate-500'
                                                    }`}>
                                                        {new Date(message.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Form */}
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Type your reply..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            rows={3}
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {sendingMessage ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Reply
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">Select a ticket</h3>
                                    <p className="mt-1 text-sm text-slate-500">Choose a ticket from the list to view and participate in the conversation.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
