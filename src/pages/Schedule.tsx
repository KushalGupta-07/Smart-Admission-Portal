import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const scheduleData = [
  {
    phase: "Registration Phase",
    events: [
      { date: "January 1, 2026", event: "Online Registration Opens", status: "completed" },
      { date: "January 20, 2026", event: "Application Form Available", status: "completed" },
      { date: "January 31, 2026", event: "Last Date for Registration", status: "upcoming" },
    ]
  },
  {
    phase: "Entrance Examination",
    events: [
      { date: "February 2, 2026", event: "Admit Card Download Begins", status: "upcoming" },
      { date: "February 15-20, 2026", event: "Entrance Examination Date", status: "upcoming" },
      { date: "February 25, 2026", event: "Answer Key Release", status: "upcoming" },
      { date: "March 1, 2026", event: "Result Declaration", status: "upcoming" },
    ]
  },
  {
    phase: "Counselling & Admission",
    events: [
      { date: "March 5, 2026", event: "Merit List Publication", status: "upcoming" },
      { date: "March 10, 2026", event: "First Round Counselling", status: "upcoming" },
      { date: "March 15, 2026", event: "Second Round Counselling", status: "upcoming" },
      { date: "March 20, 2026", event: "Spot Round (if seats available)", status: "upcoming" },
    ]
  },
  {
    phase: "Academic Session",
    events: [
      { date: "February 25, 2026", event: "Document Verification", status: "upcoming" },
      { date: "March 30, 2026", event: "Fee Payment Deadline", status: "upcoming" },
      { date: "April 1, 2026", event: "Orientation Program", status: "upcoming" },
      { date: "April 2, 2026", event: "Classes Commence", status: "upcoming" },
    ]
  },
];

const importantNotes = [
  "All dates are tentative and subject to change. Please check the portal regularly for updates.",
  "Candidates must carry original documents during counselling for verification.",
  "Fee payment must be completed within the stipulated time to confirm admission.",
  "No refund will be provided after the commencement of classes.",
];

const Schedule = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-6 md:h-8"></div>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground pt-24 md:pt-32 pb-16">
          <ScrollReveal animation="fade-in">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Important Dates & Schedule</h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Stay updated with all important dates for the admission process 2026-27
              </p>
            </div>
          </ScrollReveal>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {scheduleData.map((phase, phaseIndex) => (
              <ScrollReveal key={phaseIndex} animation="fade-up" delay={phaseIndex * 150}>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {phase.phase}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {phase.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[140px]">
                              <Clock className="h-4 w-4" />
                              {event.date}
                            </div>
                            <span className="font-medium">{event.event}</span>
                          </div>
                          <Badge
                            variant={event.status === "completed" ? "default" : "outline"}
                            className={event.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {event.status === "completed" ? "Completed" : "Upcoming"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Important Notes */}
          <ScrollReveal animation="scale-in" delay={600}>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Important Notes
                </CardTitle>
                <CardDescription>Please read carefully</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {importantNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
