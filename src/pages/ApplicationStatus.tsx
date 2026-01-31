import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle, FileCheck, Sparkles, ArrowRight, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { generateAdmitCardPDF } from "@/lib/admitCardPdf";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

type Application = Database['public']['Tables']['applications']['Row'];

const statusConfig = {
  draft: { 
    label: "Draft", 
    color: "bg-muted text-muted-foreground border-muted-foreground/20", 
    icon: FileText, 
    description: "Application started but not submitted",
    gradient: "from-gray-500/10 to-gray-600/10",
    iconColor: "text-gray-500"
  },
  submitted: { 
    label: "Submitted", 
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300", 
    icon: Clock, 
    description: "Application submitted, awaiting review",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500"
  },
  under_review: { 
    label: "Under Review", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300", 
    icon: AlertCircle, 
    description: "Application is being reviewed by our team",
    gradient: "from-yellow-500/10 to-amber-500/10",
    iconColor: "text-yellow-500"
  },
  approved: { 
    label: "Approved", 
    color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300", 
    icon: CheckCircle, 
    description: "Congratulations! Your application has been approved",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500"
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300", 
    icon: XCircle, 
    description: "Application was not approved",
    gradient: "from-red-500/10 to-rose-500/10",
    iconColor: "text-red-500"
  },
};

const ApplicationStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an application number or email",
      });
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      // Search by application number first
      let { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("application_number", searchQuery.trim().toUpperCase())
        .maybeSingle();

      // If not found, try searching by user email via profiles
      if (!data && !error) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", searchQuery.trim().toLowerCase())
          .maybeSingle();

        if (profileData) {
          const { data: appData } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", profileData.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          data = appData;
        }
      }

      setApplication(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAdmitCard = async () => {
    if (!application) return;
    try {
      setIsLoading(true);
      // Try to fetch admit card record for this application
      const { data: admitCard, error: admitError } = await supabase
        .from("admit_cards")
        .select("*")
        .eq("application_id", application.id)
        .maybeSingle();

      if (admitError || !admitCard) {
        toast({
          variant: "destructive",
          title: "Admit Card Not Found",
          description: "No admit card has been generated for this application yet.",
        });
        return;
      }

      // Fetch profile for student details (name, email, phone)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email,phone")
        .eq("user_id", application.user_id)
        .maybeSingle();

      const pdfData = {
        admitCardNumber: admitCard.admit_card_number,
        applicationNumber: application.application_number,
        studentName: profile?.full_name || "",
        courseName: application.course_name,
        preferredCollege: application.preferred_college,
        stream: application.stream,
        generatedAt: admitCard.generated_at || new Date().toISOString(),
        studentEmail: profile?.email || undefined,
        studentPhone: profile?.phone || undefined,
      };

      generateAdmitCardPDF(pdfData);
      toast({ title: "Download started", description: "Admit card is downloading." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download admit card. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-6 md:h-8"></div>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground pt-24 md:pt-32 pb-16">
          <ScrollReveal animation="fade-in">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm mb-6">
                <FileCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Application Tracker</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Check Application Status</h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Track your admission application progress in real-time
              </p>
              {user && (
                <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg">
                  <Link to="/register">
                    <Sparkles className="mr-2 h-4 w-4" />
                    New Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </ScrollReveal>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">

          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="mb-8 border-2 shadow-xl bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Search Application</CardTitle>
                    <CardDescription>Enter your application number or registered email</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Label htmlFor="search" className="sr-only">Application Number or Email</Label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="e.g., APP2025000001 or student@email.com"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} size="lg" className="h-12 px-8">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>

          {searched && (
            <ScrollReveal animation="scale-in">
              <>
                {application ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-2 shadow-xl overflow-hidden">
                      {/* Status Header with Gradient */}
                      <div className={`bg-gradient-to-r ${statusConfig[application.status].gradient} border-b-2 ${statusConfig[application.status].color.split(' ')[2] || 'border-border'}`}>
                        <CardHeader className="pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`h-12 w-12 rounded-xl bg-background/80 flex items-center justify-center border-2 ${statusConfig[application.status].color.split(' ')[2] || 'border-border'}`}>
                                {(() => {
                                  const StatusIcon = statusConfig[application.status].icon;
                                  return <StatusIcon className={`h-6 w-6 ${statusConfig[application.status].iconColor}`} />;
                                })()}
                              </div>
                              <div>
                                <CardTitle className="text-2xl mb-1">{application.application_number}</CardTitle>
                                <CardDescription className="text-base">{application.course_name}</CardDescription>
                              </div>
                            </div>
                            <Badge className={`${statusConfig[application.status].color} border-2 text-sm px-4 py-2 font-semibold`}>
                              {statusConfig[application.status].label}
                            </Badge>
                          </div>
                        </CardHeader>
                      </div>

                      <CardContent className="space-y-6 pt-6">
                        {/* Status Message */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r ${statusConfig[application.status].gradient} border-2 ${statusConfig[application.status].color.split(' ')[2] || 'border-border'}`}
                        >
                          {(() => {
                            const StatusIcon = statusConfig[application.status].icon;
                            return <StatusIcon className={`h-8 w-8 ${statusConfig[application.status].iconColor} flex-shrink-0 mt-0.5`} />;
                          })()}
                          <div>
                            <p className="font-semibold text-lg mb-1">{statusConfig[application.status].label}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {statusConfig[application.status].description}
                            </p>
                          </div>
                        </motion.div>

                        {/* Timeline */}
                        <div className="relative">
                          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Application Timeline
                          </h3>
                          <div className="relative pl-8 space-y-6">
                            {/* Timeline Line */}
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-blue-500 to-green-500"></div>
                            
                            {/* Created */}
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="relative flex items-start gap-4"
                            >
                              <div className="absolute left-[-29px] top-1 h-6 w-6 rounded-full bg-primary border-4 border-background shadow-lg flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="font-semibold text-base mb-1">Application Created</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(application.created_at).toLocaleString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </motion.div>

                            {/* Submitted */}
                            {application.submitted_at && (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative flex items-start gap-4"
                              >
                                <div className="absolute left-[-29px] top-1 h-6 w-6 rounded-full bg-blue-500 border-4 border-background shadow-lg flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="font-semibold text-base mb-1">Application Submitted</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(application.submitted_at).toLocaleString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </motion.div>
                            )}

                            {/* Reviewed */}
                            {application.reviewed_at && (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative flex items-start gap-4"
                              >
                                <div className={`absolute left-[-29px] top-1 h-6 w-6 rounded-full border-4 border-background shadow-lg flex items-center justify-center ${
                                  application.status === "approved" ? "bg-green-500" : "bg-red-500"
                                }`}>
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="font-semibold text-base mb-1">Application Reviewed</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(application.reviewed_at).toLocaleString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Remarks */}
                        {application.remarks && (
                          <div className="p-6 rounded-xl bg-muted/50 border-2 border-border">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Remarks
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {application.remarks}
                            </p>
                          </div>
                        )}

                        {/* Application Details */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-border">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            Application Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground font-medium">Course</p>
                              <p className="text-base font-semibold">{application.course_name}</p>
                            </div>
                            {application.preferred_college && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Preferred College</p>
                                <p className="text-base font-semibold">{application.preferred_college}</p>
                              </div>
                            )}
                            {application.stream && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Stream</p>
                                <p className="text-base font-semibold">{application.stream}</p>
                              </div>
                            )}
                            {application.percentage_12th && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">12th Percentage</p>
                                <p className="text-base font-semibold">{application.percentage_12th}%</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {application.status === "approved" && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button className="flex-1" variant="default">
                              <Download className="mr-2 h-4 w-4" />
                              Download Offer Letter
                            </Button>
                            <Button className="flex-1" variant="outline" onClick={handleDownloadAdmitCard} disabled={isLoading}>
                              <Download className="mr-2 h-4 w-4" />
                              {isLoading ? "Downloading..." : "Download Admit Card"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-2 shadow-xl">
                      <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">No Application Found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          We couldn't find any application with the provided details.
                          Please check your application number or email and try again.
                        </p>
                        {!user && (
                          <Button asChild variant="outline">
                            <Link to="/auth">Login to View Applications</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            </ScrollReveal>
          )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationStatus;
