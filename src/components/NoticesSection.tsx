import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Calendar, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const notices = [
  {
    id: 1,
    title: "Last Date Extended for Online Application",
    date: "2025-12-01",
    type: "important",
    description: "The last date for submitting online applications has been extended to December 15, 2025."
  },
  {
    id: 2,
    title: "Entrance Exam Schedule Released",
    date: "2025-11-28",
    type: "new",
    description: "Check the detailed schedule for entrance examinations scheduled in January 2026."
  },
  {
    id: 3,
    title: "Document Verification Dates Announced",
    date: "2025-11-25",
    type: "update",
    description: "Document verification will be conducted from January 20-25, 2026 at designated centers."
  },
  {
    id: 4,
    title: "Revised Merit List Published",
    date: "2025-11-20",
    type: "important",
    description: "The revised merit list for first-year admissions has been published on the portal."
  }
];

export const NoticesSection = () => {
  return (
    <section className="py-20 md:py-24 bg-background relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Important Notices</h2>
                <p className="text-muted-foreground mt-1">Stay updated with latest announcements from the university</p>
              </div>
            </div>
            <a href="#" className="text-primary font-medium hover:underline flex items-center gap-2 group">
              View All Notices
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice, index) => (
            <ScrollReveal
              key={notice.id}
              delay={index * 100}
              viewOffset={0.1}
            >
              <Card
                className="group p-6 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>

                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${notice.type === 'important' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={notice.type === "important" ? "destructive" : "secondary"}
                        className="uppercase text-[10px] tracking-wider"
                      >
                        {notice.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notice.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                        {notice.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {notice.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
