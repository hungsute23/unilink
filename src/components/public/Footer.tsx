import Link from "next/link";
import { GraduationCap } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      ["Universities",  "/schools"],
      ["Scholarships",  "/scholarships"],
      ["Job Board",     "/jobs"],
      ["Community",     "/community"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Study Guide",      "/blog"],
      ["Visa Procedures",  "/visa"],
      ["About Us",         "/about"],
    ],
  },
  {
    title: "Network",
    links: [
      ["Taipei, Taiwan",  "#"],
      ["Monstudio",       "https://monstudio.me"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="py-20 bg-foreground text-background border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="container relative z-10 px-6 mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-background">UniLink</span>
            </div>
            <p className="text-background/40 text-sm leading-relaxed">
              The #1 educational &amp; career gateway for international students in Taiwan, powered by Monstudio.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-5">
              <h5 className="text-xs font-bold uppercase tracking-widest text-background/30">
                {col.title}
              </h5>
              <div className="flex flex-col gap-3.5">
                {col.links.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-background/60 hover:text-background transition-colors font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center text-background/25 text-xs gap-4">
          <span>
            © 2025 UniLink. Developed by{" "}
            <a
              href="https://monstudio.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/60 transition-colors"
            >
              Monstudio
            </a>.
          </span>
          <div className="flex gap-8">
            <span className="text-primary/60">AI Engine v1.0</span>
            <span>UTC+8 Taipei</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
