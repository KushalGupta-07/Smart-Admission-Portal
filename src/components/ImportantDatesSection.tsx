import { Card } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const importantDates = [
  {
    event: "Application Start Date",
    date: "December 1, 2025",
    time: "10:00 AM",
    status: "active"
  },
  {
    event: "Last Date for Registration",
    date: "December 15, 2025",
    time: "11:59 PM",
    status: "upcoming"
  },
  {
    event: "Admit Card Release",
    date: "January 5, 2026",
    time: "12:00 PM",
    status: "upcoming"
  },
  {
    event: "Entrance Examination",
    date: "January 15-20, 2026",
    time: "Various Slots",
    status: "upcoming"
  },
  {
    event: "Result Declaration",
    date: "February 1, 2026",
    time: "5:00 PM",
    status: "upcoming"
  },
  {
    event: "Counselling Begins",
    date: "February 10, 2026",
    time: "10:00 AM",
    status: "upcoming"
  }
];

export const ImportantDatesSection = () => {
  return (
    <section className="py-20 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Important Dates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Mark your calendar with these crucial admission milestones to ensure you don't miss any deadline.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 md:transform md:-translate-x-1/2"></div>

            <div className="space-y-12">
              {importantDates.map((item, index) => (
                <div
                  key={index}
                  className="relative group "
                >
                  <div className={`flex flex-col md:flex-row gap-8 md:gap-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Content */}
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <ScrollReveal delay={index * 150} viewOffset={0.1}>
                        <Card className={`p-6 border-primary/10 ml-16 md:ml-0 relative overflow-hidden group-hover:border-primary/40 transition-colors`}>
                          <div className={`absolute top-0 w-1 h-full bg-gradient-to-b from-primary to-accent ${index % 2 === 0 ? 'right-0 md:left-auto md:right-0' : 'left-0'}`}></div>

                          <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                            <div className="flex items-center gap-2 mb-3">
                              {item.status === "active" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  Active Now
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {item.event}
                            </h3>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                {item.date}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                {item.time}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </ScrollReveal>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center">
                      <ScrollReveal delay={index * 150} animation="scale-in">
                        <div className="w-4 h-4 rounded-full bg-background border-4 border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)] group-hover:scale-125 transition-transform duration-300 z-10"></div>
                      </ScrollReveal>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
