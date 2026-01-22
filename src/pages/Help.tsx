import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MessageCircle, Clock4, ShieldCheck, Sparkles } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> We respond within 24 hours
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">Help & Support</h1>
              <p className="text-muted-foreground max-w-2xl">
                Browse FAQs or reach out directly. Our support team is available to help with applications, payments, and account issues.
              </p>
            </div>
            <Badge variant="secondary" className="self-start md:self-auto">
              Live status: Online
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Quick answers to common issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How do I check my application status?</AccordionTrigger>
                      <AccordionContent>
                        Navigate to the <b>Status</b> page from the top navigation or your dashboard shortcuts. You'll see a timeline with review, payment, and admit-card milestones.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What documents are required for admission?</AccordionTrigger>
                      <AccordionContent>
                        Typically: government ID, recent photograph, academic transcripts, and category certificates (if applicable). Upload clear PDFs/JPGs under 2MB each in the Documents section.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Can I edit my application after submission?</AccordionTrigger>
                      <AccordionContent>
                        Submitted applications are locked for compliance. For corrections, raise a ticket with the field to update and attach supporting documents. We respond within one business day.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Payment failed but money was deducted</AccordionTrigger>
                      <AccordionContent>
                        Payment gateways can take up to 30 minutes to confirm. If it stays pending, share the transaction ID/UTR via the form below; we'll verify and unlock your application.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submit a support ticket</CardTitle>
                  <CardDescription>Share details so we can resolve your issue faster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Input placeholder="e.g. Payment not reflecting" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Details</label>
                    <Textarea rows={4} placeholder="Share context, dates, and any reference IDs." />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Your data stays encrypted in transit
                    </p>
                    <Button className="w-full sm:w-auto">Send to support</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact us directly</CardTitle>
                  <CardDescription>Pick the channel you prefer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Live chat</p>
                      <p className="text-sm text-muted-foreground">9 AM - 7 PM IST, Mon-Sat</p>
                    </div>
                  </div>
                  <Button className="w-full gap-2">
                    <Mail className="h-4 w-4" /> Email Support
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Phone className="h-4 w-4" /> Call Helpline
                  </Button>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock4 className="h-4 w-4 text-primary" />
                    Typical first response: under 2 hours
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/60 border-dashed">
                <CardHeader>
                  <CardTitle>Popular topics</CardTitle>
                  <CardDescription>Start with these quick links</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary">Resend verification email</Badge>
                  <Badge variant="secondary">Update phone number</Badge>
                  <Badge variant="secondary">Refund status</Badge>
                  <Badge variant="secondary">Exam center change</Badge>
                  <Badge variant="secondary">Document formats</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;