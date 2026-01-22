import { Card } from "@/components/ui/card";
import {
  UserPlus,
  FileSearch,
  Download,
  Award,
  BookOpen,
  HelpCircle,
  CreditCard,
  FileText,
  Zap
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const quickLinks = [
  {
    icon: UserPlus,
    title: "New Registration",
    description: "Start application",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: FileSearch,
    title: "Track Status",
    description: "View application progress",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    icon: Download,
    title: "Admit Card",
    description: "Download for exam",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    icon: Award,
    title: "Results",
    description: "Check your scores",
    gradient: "from-emerald-500 to-green-500"
  },
  {
    icon: CreditCard,
    title: "Fee Payment",
    description: "Secure online payment",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Requirements checklist",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: BookOpen,
    title: "Courses",
    description: "Browse academic programs",
    gradient: "from-cyan-500 to-teal-500"
  },
  {
    icon: HelpCircle,
    title: "Support",
    description: "Get assistance",
    gradient: "from-slate-500 to-gray-500"
  }
];

export const QuickLinksSection = () => {
  return (
    <section className="py-20 md:py-24 bg-muted/30">

      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4 fill-primary" />
              <span>Quick Actions</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Access essential services and information instantly with our simplified dashboard
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <ScrollReveal
                key={index}
                delay={index * 50}
                viewOffset={0.1}
                animation="scale-in"
              >
                <Card
                  className="group relative p-6 cursor-pointer border-0 bg-card/50 hover:bg-card overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${link.gradient} p-[1px] group-hover:scale-110 transition-transform duration-500`}>
                      <div className="h-full w-full rounded-2xl bg-card flex items-center justify-center">
                        <Icon className="h-7 w-7 text-foreground" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-20 blur-2xl rounded-full transition-opacity duration-500 pointer-events-none`}></div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};