import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiveStatsCard } from "@/components/LiveStatsCard";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDashboardStats } from "@/hooks/useStudentDashboardStats";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Home,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  BookOpen,
  Mail,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const milestones = [
  { title: "Profile completed", status: "Done", icon: CheckCircle2, date: "Today" },
  { title: "Documents verified", status: "Pending", icon: FileText, date: "Awaiting" },
  { title: "Application review", status: "In progress", icon: Clock, date: "ETA: 3 days" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { applicationsCount, pendingTasks, messages, profileScore } = useStudentDashboardStats(user?.id);
  const displayName = user?.user_metadata?.full_name || "Applicant";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="font-medium text-foreground">Dashboard</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 md:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-primary/30">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Sparkles className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Applicant</p>
                      <p className="font-semibold">{displayName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Welcome back
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {displayName}, let's finish your admission journey
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Track application progress, upcoming tasks, and get quick access to support—all in one place.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">Application ID: SA-2026-0124</span>
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Status: In Progress
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Last updated: 2 days ago
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button asChild className="rounded-full">
                    <Link to="/register">
                      New Application <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Link to="/settings" className="text-sm font-medium text-primary flex items-center gap-2 hover:underline">
                    Manage profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LiveStatsCard
                  title="Applications"
                  value={applicationsCount}
                  icon={FileText}
                  color="primary"
                  trend={12}
                />
                <LiveStatsCard
                  title="Pending Tasks"
                  value={pendingTasks}
                  icon={Clock}
                  color="warning"
                  trend={-4}
                  delay={0.05}
                />
                <LiveStatsCard title="Messages" value={messages} icon={Mail} color="secondary" trend={8} delay={0.1} />
                <LiveStatsCard title="Profile Score" value={profileScore} icon={Shield} color="success" delay={0.15} />
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Application timeline</CardTitle>
                    <CardDescription>Your next steps to complete the process</CardDescription>
                  </div>
                  <Link to="/application-status" className="text-sm text-primary font-medium flex items-center gap-2">
                    View full status <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestones.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center justify-between p-4 rounded-xl border bg-muted/40 hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            idx === 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-6"
            >
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Upcoming</CardTitle>
                  <CardDescription>Important dates to remember</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Entrance Exam Slot</p>
                      <p className="text-sm text-muted-foreground">January 15, 2026 • 09:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Document Verification</p>
                      <p className="text-sm text-muted-foreground">January 22, 2026 • Upload scans before 5 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                  <CardDescription>Jump right into your most used areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/settings"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">Profile & preferences</p>
                      <p className="text-sm text-muted-foreground">Update contact info and notification rules</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/results"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">Results</p>
                      <p className="text-sm text-muted-foreground">Check released scorecards</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/help"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">Help & Support</p>
                      <p className="text-sm text-muted-foreground">Chat with support or browse FAQs</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;