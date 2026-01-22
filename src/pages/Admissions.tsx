import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, FileText, CreditCard, GraduationCap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const eligibility = [
  "Must have passed 12th standard or equivalent examination",
  "Minimum 50% marks in qualifying examination (45% for reserved categories)",
  "Valid entrance exam score (where applicable)",
  "Age limit: Maximum 25 years as on 1st July 2025 (30 years for reserved categories)",
];

const documents = [
  "10th Class Mark Sheet and Certificate",
  "12th Class Mark Sheet and Certificate",
  "Transfer Certificate / Migration Certificate",
  "Character Certificate",
  "Entrance Exam Score Card (if applicable)",
  "Category Certificate (if applicable)",
  "Passport Size Photographs (4 copies)",
  "Valid ID Proof (Aadhar/PAN/Passport)",
];

const feeStructure = [
  { course: "B.Tech (All Branches)", tuition: "₹85,000", development: "₹15,000", total: "₹1,00,000" },
  { course: "B.Sc (All Branches)", tuition: "₹35,000", development: "₹10,000", total: "₹45,000" },
  { course: "B.Com", tuition: "₹30,000", development: "₹8,000", total: "₹38,000" },
  { course: "BBA", tuition: "₹40,000", development: "₹10,000", total: "₹50,000" },
];

const faqs = [
  {
    question: "How do I apply for admission?",
    answer: "You can apply online through our portal by clicking on 'New Registration'. Create an account, fill in the application form, upload required documents, and submit. You will receive a confirmation email with your application number."
  },
  {
    question: "What is the deadline for applications?",
    answer: "The application deadline for the academic year 2025-26 is June 30, 2025. Late applications may be considered based on seat availability."
  },
  {
    question: "Is there any entrance exam required?",
    answer: "For B.Tech courses, candidates must have a valid JEE Main score. For other courses, admission is based on merit (12th percentage) and may include an interview."
  },
  {
    question: "How will I know if my application is accepted?",
    answer: "You can check your application status using the 'Check Status' feature on our portal. You will also receive email notifications at each stage of the process."
  },
  {
    question: "What are the payment options for fees?",
    answer: "We accept online payments (Credit/Debit cards, Net Banking, UPI), Demand Draft, and Bank Transfer. Payment can be made in full or in installments (with prior approval)."
  },
];

const Admissions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <ScrollReveal animation="fade-in">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Admissions 2025-26</h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join us for academic excellence. Applications are now open for undergraduate programs.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Eligibility */}
            <ScrollReveal animation="slide-in-right" delay={200}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Eligibility Criteria
                  </CardTitle>
                  <CardDescription>Requirements for admission</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {eligibility.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Documents Required */}
            <ScrollReveal animation="slide-in-left" delay={400}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documents Required
                  </CardTitle>
                  <CardDescription>Keep these documents ready</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {documents.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Fee Structure */}
          <ScrollReveal animation="fade-up" delay={500}>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Fee Structure (Per Year)
                </CardTitle>
                <CardDescription>Academic year 2025-26</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Course</th>
                        <th className="text-right py-3 px-4 font-medium">Tuition Fee</th>
                        <th className="text-right py-3 px-4 font-medium">Development Fee</th>
                        <th className="text-right py-3 px-4 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructure.map((fee, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">{fee.course}</td>
                          <td className="text-right py-3 px-4">{fee.tuition}</td>
                          <td className="text-right py-3 px-4">{fee.development}</td>
                          <td className="text-right py-3 px-4 font-medium">{fee.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Additional charges may apply for hostel, examination, and other facilities.
                  Scholarships available for meritorious and economically weaker students.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* FAQs */}
          <ScrollReveal animation="fade-up" delay={600}>
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admissions;
