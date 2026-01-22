import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, ArrowRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-white pt-20 pb-10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-violet-500"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                SA
              </div>
              <span className="text-xl font-bold tracking-tight">Smart Admission</span>
            </div>
            <p className="text-gray-400 leading-relaxed font-light">
              The official portal designed to streamline your academic journey. From application to admission, we are with you every step of the way.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {['New Registration', 'Application Status', 'Download Admit Card', 'Check Results', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="group flex items-center text-gray-400 hover:text-emerald-400 transition-colors">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              {['User Manual', 'Course Details', 'Fee Structure', 'Important Documents', 'Contact Support'].map((item) => (
                <li key={item}>
                  <a href="#" className="group flex items-center text-gray-400 hover:text-violet-400 transition-colors">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-gray-400 group hover:text-white transition-colors">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="leading-tight">
                  123 Education Street, <br />University Area, City - 400001
                </span>
              </li>
              <li className="flex items-center gap-4 text-gray-400 group hover:text-white transition-colors">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <span>+91 22 1234 5678</span>
              </li>
              <li className="flex items-center gap-4 text-gray-400 group hover:text-white transition-colors">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <span>admissions@portal.edu</span>
              </li>
            </ul>

            <div className="flex gap-3 mt-8">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110 transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p className="hover:text-gray-300 transition-colors">© 2025 Smart Admission Portal. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
