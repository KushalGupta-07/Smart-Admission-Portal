import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, Award, FileText, Lock, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type Application = Database['public']['Tables']['applications']['Row'];

const Results = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["approved", "rejected"])
        .order("reviewed_at", { ascending: false });

      if (data) setApplications(data);
      setLoading(false);
    };

    if (!authLoading) fetchResults();
  }, [user, authLoading]);

  const filteredApplications = applications.filter(
    app => app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <ScrollReveal animation="fade-in">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Results & Merit List</h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                View your admission results and download offer letters
              </p>
            </div>
          </ScrollReveal>
        </section>

        <div className="container mx-auto px-4 py-12">
          {!user ? (
            <ScrollReveal animation="fade-up">
              <Card className="max-w-md mx-auto">
                <CardContent className="py-12 text-center">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Please login to view your results and download documents
                  </p>
                  <Button onClick={() => navigate("/auth")}>Login to Continue</Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Search */}
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="flex gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by application number or course..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </ScrollReveal>

              {/* Results */}
              {applications.length === 0 ? (
                <ScrollReveal animation="fade-up">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Results Available</h3>
                      <p className="text-muted-foreground">
                        Your application results will appear here once they are declared.
                        Please check back after the result announcement date.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ) : filteredApplications.length === 0 ? (
                <ScrollReveal animation="fade-up">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                      <p className="text-muted-foreground">
                        No results match your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app, index) => (
                    <ScrollReveal key={app.id} animation="fade-up" delay={index * 100}>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {app.status === "approved" && <Award className="h-5 w-5 text-green-600" />}
                                {app.application_number}
                              </CardTitle>
                              <CardDescription>{app.course_name}</CardDescription>
                            </div>
                            <Badge className={app.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"}>
                              {app.status === "approved" ? "Approved" : "Not Selected"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {app.preferred_college && (
                              <div>
                                <p className="text-sm text-muted-foreground">Allocated College</p>
                                <p className="font-medium">{app.preferred_college}</p>
                              </div>
                            )}
                            {app.reviewed_at && (
                              <div>
                                <p className="text-sm text-muted-foreground">Result Date</p>
                                <p className="font-medium">{new Date(app.reviewed_at).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>

                          {app.remarks && (
                            <div className="p-4 bg-muted/50 rounded-lg mb-4">
                              <p className="text-sm text-muted-foreground mb-1">Remarks</p>
                              <p className="text-sm">{app.remarks}</p>
                            </div>
                          )}

                          {app.status === "approved" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Offer Letter
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download Fee Receipt
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </ScrollReveal>
                  ))}
                </div>
              )}

              {/* Merit List Info */}
              <ScrollReveal animation="fade-up" delay={400}>
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Merit List Information</CardTitle>
                    <CardDescription>Important details about merit list publication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The merit list is prepared based on the entrance examination scores and academic performance.
                      Candidates are advised to regularly check this page and their registered email for updates.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-1">First Merit List</p>
                        <p className="text-sm text-muted-foreground">August 5, 2025</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-1">Second Merit List</p>
                        <p className="text-sm text-muted-foreground">August 15, 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
