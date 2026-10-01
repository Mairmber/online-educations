import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const HERO_IMG = "https://media.base44.com/images/public/6a77e31e472b18b3800d425d/9f68bae17_generated_401f1f3b.jpg";

const CATEGORIES = [
  { icon: "📘", label: "JHS Classes" },
  { icon: "📗", label: "SHS Classes" },
  { icon: "🎓", label: "University" },
  { icon: "🧑‍🎓", label: "Adult Classes" },
  { icon: "🗓️", label: "Weekend Classes" },
  { icon: "🌴", label: "Vacation Classes" },
  { icon: "💼", label: "Business Skills" },
  { icon: "💻", label: "Technology" },
];

const CAT_TINTS = ["", "", "bg-[#fff4c9]", "bg-[#e9f0ff]", "", "", "bg-[#fff4c9]", "bg-[#e9f0ff]"];

const STATS = [
  { value: "4", label: "Levels" },
  { value: "Live", label: "Weekend & Vacation" },
  { value: "8+", label: "Categories" },
  { value: "Paid", label: "Extra Classes" },
];

const WHY = [
  { title: "Live, Not Recorded", desc: "Real teachers, real classrooms on weekends and during school vacations — join from home, anywhere.", tint: "bg-[#e9f0ff]" },
  { title: "Every Level Covered", desc: "From JHS and SHS to university, plus adult classes for those who dropped out or balance business with study.", tint: "bg-[#fff4c9]" },
  { title: "Tuition-Free School", desc: "Our school is tuition-free, but paid extra classes are required — not optional — to attend live weekend & vacation sessions.", tint: "bg-[#e9efff]" },
  { title: "Flexible Payment", desc: "Pay with MoMo, PayPal, Stripe, Paystack, or Visa/MasterCard — choose what works for you.", tint: "bg-[#e4f8ee]" },
];

const TILE = "bg-white border border-[#dce4ff] rounded-[20px] shadow-[0_7px_16px_rgba(52,78,152,0.06)] transition-all duration-[220ms] animate-[pop_0.7s_cubic-bezier(0.2,1.3,0.4,1)_both] hover:border-[#6e8eff] hover:shadow-[0_12px_22px_rgba(49,84,196,0.15)] hover:-translate-y-0.5 active:translate-y-0";

const SECTION_HEAD = "flex items-end justify-between gap-2.5 mx-0.5 mt-4 mb-3";
const SECTION_TITLE = "text-[22px] sm:text-3xl leading-[1.05] tracking-[-0.8px] font-extrabold text-[#16234a] m-0";

const ACTION = "text-center rounded-[13px] border py-2.5 px-2 text-[11px] sm:text-sm font-extrabold transition-all duration-200 hover:bg-white hover:text-[#173ca9] hover:shadow-[0_5px_12px_rgba(16,43,122,0.27)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe27a] active:translate-y-px";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f9ff] overflow-x-hidden">
      <SiteNav />

      {/* Hero */}
      <section className="relative mx-3 mt-3 sm:mx-6 sm:mt-4 lg:mx-auto lg:max-w-5xl overflow-hidden rounded-[30px] bg-[#2558e8] text-white p-4 pb-3.5 shadow-[0_16px_35px_rgba(36,88,232,0.24)] animate-[rise_0.65s_cubic-bezier(0.2,1.35,0.4,1)_both]">
        <div className="absolute w-[190px] h-[190px] rounded-full bg-[#6c87ff]/30 -right-16 -top-[70px] pointer-events-none" />
        <div className="absolute w-[120px] h-[120px] rounded-[32px] bg-[#143cae]/30 -left-14 -bottom-16 rotate-[25deg] pointer-events-none" />
        <img src={HERO_IMG} alt="Students learning live at Eduqasion" className="relative z-[1] w-full h-[134px] sm:h-56 object-cover rounded-[21px] opacity-90" />
        <div className="relative z-[1] pt-4 px-0.5 pb-2.5">
          <span className="inline-block bg-[#ffe27a] text-[#173ca9] rounded-full px-2.5 py-1.5 text-[10px] font-extrabold tracking-wide">
            Live Extra Classes · Weekend &amp; Vacation
          </span>
          <h1 className="text-[30px] md:text-5xl leading-[1.04] tracking-[-1.5px] font-extrabold max-w-[350px] mt-3 mb-2">
            Learn Live on Weekends &amp; Vacations. From JHS to University — and Beyond.
          </h1>
          <p className="text-[#dce5ff] text-xs sm:text-base leading-relaxed max-w-xl m-0">
            Eduqasion brings live extra classes to JHS, SHS and university students, plus adult learners who dropped out or juggle business with study. School tuition is free, but paid extra classes are required — not optional — to join live weekend &amp; vacation sessions.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Link to={isAuthenticated ? "/student-portal" : "/student-login"} className={`${ACTION} bg-[#ffe27a] text-[#173ca9] border-[#ffe27a]`}>Student Portal</Link>
            <Link to="/courses" className={`${ACTION} bg-white/10 border-white/30 text-white`}>Browse Courses</Link>
            <Link to="/ask" className={`${ACTION} bg-white/10 border-white/30 text-white`}>Get Help</Link>
            <Link to="/ai-teachers" className={`${ACTION} bg-white/10 border-white/30 text-white`}>AI Teachers</Link>
          </div>
        </div>
        <div className="relative z-[1] grid grid-cols-4 gap-1.5 mt-3.5 pt-3 border-t border-white/20">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <strong className="block text-lg leading-none font-extrabold text-white">{s.value}</strong>
              <span className="block mt-1 text-[8px] leading-tight text-[#dbe4ff]">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-3 sm:px-6 lg:max-w-5xl lg:mx-auto">
        <div className={SECTION_HEAD}>
          <h2 className={SECTION_TITLE}>What Will You Learn Today?</h2>
          <p className="text-[10px] text-[#7180a0] text-right m-0">Choose a subject area and start your journey</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORIES.map((cat, i) => (
            <Link to={`/courses?category=${cat.label}`} key={cat.label} className={`${TILE} ${CAT_TINTS[i]} p-3.5 min-h-[112px] flex flex-col justify-between`} style={{ animationDelay: `${Math.min(i * 0.05, 0.25)}s` }}>
              <span className="text-[25px] leading-none block">{cat.icon}</span>
              <h3 className="mt-2.5 text-[13px] leading-[1.1] font-extrabold text-[#1e2d55]">{cat.label}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Eduqasion */}
      <section className="px-3 sm:px-6 lg:max-w-5xl lg:mx-auto">
        <div className={SECTION_HEAD}>
          <h2 className={SECTION_TITLE}>Why Eduqasion?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {WHY.map((item, i) => (
            <article key={item.title} className={`${TILE} ${item.tint} p-3.5 min-h-[142px]`} style={{ animationDelay: `${Math.min(i * 0.05, 0.25)}s` }}>
              <div className="w-[30px] h-[30px] rounded-[11px] bg-[#2558e8] text-white grid place-items-center text-[17px] font-extrabold mb-3">✓</div>
              <h3 className="text-sm sm:text-[15px] font-extrabold text-[#1e2d55] mb-1.5">{item.title}</h3>
              <p className="text-[11px] leading-[1.45] text-[#62708c] m-0">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* About: Story, Vision & Mission, Core Values, Founder */}
      <AboutSection />

      {/* Success stories & student testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <section className="mx-3 my-3 sm:mx-6 lg:mx-auto lg:max-w-5xl rounded-[25px] bg-[#ffe27a] text-[#173ca9] p-5 text-center">
        <h2 className="text-[23px] sm:text-4xl leading-[1.05] font-extrabold tracking-[-0.7px] m-0">Go Further With Live Extra Classes.</h2>
        <p className="text-[11px] sm:text-sm leading-[1.45] mt-2 mb-3.5">School tuition is free, but paid weekend &amp; vacation classes are required to attend. They help you catch up, get ahead, and stay on track.</p>
        <Link to="/courses" className="block bg-[#2458e8] text-white rounded-[13px] py-2.5 px-4 text-xs sm:text-sm font-extrabold transition-all duration-200 hover:bg-[#173ca9] hover:shadow-[0_5px_12px_rgba(23,60,169,0.33)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458e8] active:translate-y-px">
          Browse All Courses →
        </Link>
      </section>

      {/* Portal Entry Cards */}
      <section className="px-3 pb-3 sm:px-6 lg:max-w-5xl lg:mx-auto">
        <div className={SECTION_HEAD}>
          <h2 className={SECTION_TITLE}>Access Your Portal</h2>
        </div>
        <div className="grid gap-2.5">
          {[
            { title: "Student Portal", desc: "My courses, grades, library & assignments", cta: "Access Portal", path: isAuthenticated ? "/student-portal" : "/student-login", bg: "bg-[#2458e8]" },
            { title: "Instructor Dashboard", desc: "Students, submissions & class performance", cta: "Faculty Access", path: "/instructor", bg: "bg-[#7055d9]" },
            { title: "Admin Panel", desc: "Manage courses, content & platform", cta: "Admin Access", path: "/admin", bg: "bg-[#243452]" },
          ].map(portal => (
            <Link key={portal.title} to={portal.path} className={`${portal.bg} block text-white p-4 rounded-[21px] min-h-[119px] transition-all duration-200 hover:shadow-[0_10px_20px_rgba(25,50,118,0.21)] hover:brightness-105 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe27a]`}>
              <h3 className="text-base font-extrabold mb-1">{portal.title}</h3>
              <p className="text-[10px] sm:text-xs text-[#e0e6ff] leading-snug m-0">{portal.desc}</p>
              <span className="mt-3 inline-block text-[#173ca9] bg-[#ffe27a] rounded-[10px] px-2.5 py-1.5 text-[10px] font-extrabold">{portal.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}