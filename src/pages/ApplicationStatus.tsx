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
import { Search, Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Application = Database['public']['Tables']['applications']['Row'];

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText, description: "Application started but not submitted" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Clock, description: "Application submitted, awaiting review" },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, description: "Application is being reviewed" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle, description: "Congratulations! Your application has been approved" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle, description: "Application was not approved" },
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal animation="fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">Check Application Status</h1>
              <p className="text-muted-foreground mb-8">
                Track the status of your admission application
              </p>
              {user && (
                <div className="flex justify-center">
                  <Button asChild className="rounded-full">
                    <Link to="/register">New Application</Link>
                  </Button>
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Search Application</CardTitle>
                <CardDescription>Enter your application number or registered email</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Application Number or Email</Label>
                    <Input
                      id="search"
                      placeholder="e.g., APP2025000001 or student@email.com"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>

          {searched && (
            <ScrollReveal animation="scale-in">
              <>
                {application ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{application.application_number}</CardTitle>
                          <CardDescription>{application.course_name}</CardDescription>
                        </div>
                        <Badge className={statusConfig[application.status].color}>
                          {statusConfig[application.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Status Message */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        {(() => {
                          const StatusIcon = statusConfig[application.status].icon;
                          return <StatusIcon className="h-8 w-8 text-primary" />;
                        })()}
                        <div>
                          <p className="font-medium">{statusConfig[application.status].label}</p>
                          <p className="text-sm text-muted-foreground">
                            {statusConfig[application.status].description}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h3 className="font-medium mb-4">Application Timeline</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Application Created</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(application.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {application.submitted_at && (
                            <div className="flex items-center gap-4">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Application Submitted</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(application.submitted_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          {application.reviewed_at && (
                            <div className="flex items-center gap-4">
                              <div className={`h-3 w-3 rounded-full ${application.status === "approved" ? "bg-green-500" : "bg-red-500"
                                }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Application Reviewed</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(application.reviewed_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remarks */}
                      {application.remarks && (
                        <div>
                          <h3 className="font-medium mb-2">Remarks</h3>
                          <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                            {application.remarks}
                          </p>
                        </div>
                      )}

                      {/* Application Details */}
                      <div>
                        <h3 className="font-medium mb-2">Application Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Course</p>
                            <p className="font-medium">{application.course_name}</p>
                          </div>
                          {application.preferred_college && (
                            <div>
                              <p className="text-muted-foreground">Preferred College</p>
                              <p className="font-medium">{application.preferred_college}</p>
                            </div>
                          )}
                          {application.stream && (
                            <div>
                              <p className="text-muted-foreground">Stream</p>
                              <p className="font-medium">{application.stream}</p>
                            </div>
                          )}
                          {application.percentage_12th && (
                            <div>
                              <p className="text-muted-foreground">12th Percentage</p>
                              <p className="font-medium">{application.percentage_12th}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Application Found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any application with the provided details.
                        Please check your application number or email and try again.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            </ScrollReveal>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationStatus;
