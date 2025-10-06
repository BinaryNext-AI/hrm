import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  LogIn
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">HRM System</span>
          </div>
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Streamline Your
              <span className="text-slate-600"> Workforce</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Professional HRM system with role-based dashboards, time tracking, 
              task management, and real-time collaboration for admins, recruiters, and workers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-lg px-8 py-6">
                <Link href="/login">
                  Access Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Your Team
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed for modern workforce management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Dedicated dashboards for Admins, Recruiters, and Workers with appropriate permissions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>
                  Advanced time tracking with activity monitoring, daily reports, and productivity analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Create, assign, and track tasks with priority levels, due dates, and progress monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Support System</CardTitle>
                <CardDescription>
                  Integrated support tickets with threaded conversations between workers and admins
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Enterprise-grade security with JWT tokens, password hashing, and role-based access control
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Live updates, notifications, and real-time collaboration across all user roles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Workforce Management?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of teams already using our HRM system to streamline their operations
          </p>
          <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-lg px-8 py-6">
            <Link href="/login">
              <LogIn className="h-5 w-5 mr-2" />
              Login to Dashboard
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">HRM System</span>
            </div>
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} HRM System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
