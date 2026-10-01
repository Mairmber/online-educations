const STORY_IMG = "https://media.base44.com/images/public/6a77e31e472b18b3800d425d/8c5bc1c99_generated_image.png";

const CORE_VALUES = [
  { title: "Accessibility", desc: "Quality education within reach of every learner — tuition-free at the core." },
  { title: "Excellence", desc: "Live teaching, real practice, and high standards in every class." },
  { title: "Community", desc: "Learning grows stronger together — students, teachers and mentors supporting one another." },
  { title: "Integrity", desc: "Honest guidance and human supervision in everything we do." },
  { title: "Innovation", desc: "AI co-teachers and modern tools that meet learners where they are." },
  { title: "Empowerment", desc: "Equipping students with knowledge to change their lives and communities." },
];

const FOUNDER = { name: "Ernest Amenuvor", title: "Founder & CEO", detail: "BSc Computer Science · University of the People (UoPeople)" };

const TILE = "bg-white border border-[#dce4ff] rounded-[20px] shadow-[0_7px_16px_rgba(52,78,152,0.06)] transition-all duration-[220ms] animate-[pop_0.7s_cubic-bezier(0.2,1.3,0.4,1)_both] hover:border-[#6e8eff] hover:shadow-[0_12px_22px_rgba(49,84,196,0.15)] hover:-translate-y-0.5 active:translate-y-0";

function initials(name) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AboutSection() {
  return (
    <section className="px-3 sm:px-6 lg:max-w-5xl lg:mx-auto">
      {/* Our Story */}
      <div className="flex items-end justify-between gap-2.5 mx-0.5 mt-4 mb-3">
        <h2 className="text-[22px] sm:text-3xl leading-[1.05] tracking-[-0.8px] font-extrabold text-[#16234a] m-0">Our Story</h2>
      </div>
      <article className="bg-white border border-[#dce4ff] rounded-[25px] p-2.5 grid grid-cols-[118px_1fr] sm:grid-cols-[280px_1fr] gap-3 items-center">
        <img src={STORY_IMG} alt="Students learning together at Eduqasion" className="w-[118px] h-[118px] sm:w-full sm:h-auto sm:aspect-[4/3] object-cover rounded-[18px]" />
        <div className="py-2 pr-1 sm:py-4 sm:pr-6">
          <p className="text-[11px] sm:text-sm leading-[1.45] sm:leading-relaxed text-[#66738e] m-0">
            Eduqasion began as a small weekend tutoring initiative in Ghana, born from a simple belief: every learner deserves a seat in the classroom — regardless of background, income, or location.
          </p>
          <p className="text-[11px] sm:text-sm leading-[1.45] sm:leading-relaxed text-[#66738e] mt-2 m-0">
            What started with a handful of students gathering for vacation classes has grown into a live online learning portal serving JHS, SHS, university and adult learners across communities.
          </p>
          <p className="text-[11px] sm:text-sm leading-[1.45] sm:leading-relaxed text-[#66738e] mt-2 m-0">
            Today, Eduqasion connects learners with live teachers and AI co-teachers under human supervision — so help is always within reach, wherever you are.
          </p>
        </div>
      </article>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
        <div className="bg-white border border-[#dce4ff] rounded-[20px] p-3.5">
          <h3 className="text-sm font-extrabold text-[#1e2d55] mb-1.5">Our Vision</h3>
          <p className="text-[10px] sm:text-xs leading-[1.45] text-[#687792] m-0">A world where every learner — from the village to the city — can access live, quality education and build a brighter future.</p>
        </div>
        <div className="bg-white border border-[#dce4ff] rounded-[20px] p-3.5">
          <h3 className="text-sm font-extrabold text-[#1e2d55] mb-1.5">Our Mission</h3>
          <p className="text-[10px] sm:text-xs leading-[1.45] text-[#687792] m-0">To deliver tuition-free, live extra classes and AI-supported learning that empower underprivileged students to complete school, master their subjects, and thrive.</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="flex items-end justify-between gap-2.5 mx-0.5 mt-5 mb-3">
        <h2 className="text-[22px] sm:text-3xl leading-[1.05] tracking-[-0.8px] font-extrabold text-[#16234a] m-0">Our Core Values</h2>
        <p className="text-[10px] text-[#7180a0] text-right m-0">What We Stand For</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {CORE_VALUES.map((v, i) => (
          <div key={v.title} className={`${TILE} p-3.5 min-h-[138px]`} style={{ animationDelay: `${Math.min(i * 0.05, 0.25)}s` }}>
            <h3 className="text-[13px] font-extrabold text-[#1e2d55] mb-1">{v.title}</h3>
            <p className="text-[10px] sm:text-xs leading-[1.45] text-[#687792] m-0">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Leadership / Founder */}
      <div className="mt-2.5 bg-[#2458e8] text-white rounded-[23px] p-4 flex gap-3 items-center">
        <div className="w-[54px] h-[54px] rounded-[18px] bg-[#ffe27a] text-[#173ca9] grid place-items-center text-[17px] font-extrabold shrink-0">
          {initials(FOUNDER.name)}
        </div>
        <div>
          <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#9db9ff] mb-1">Leadership</span>
          <h3 className="text-base font-extrabold m-0">{FOUNDER.name}</h3>
          <p className="text-[10px] leading-snug text-[#dbe4ff] mt-1 m-0">
            <span className="text-[#ffe27a] font-bold">{FOUNDER.title}</span> · {FOUNDER.detail}
          </p>
        </div>
      </div>
    </section>
  );
}