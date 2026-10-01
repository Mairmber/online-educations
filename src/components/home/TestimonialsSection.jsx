const PHOTOS = {
  amita: "https://media.base44.com/images/public/6a77e31e472b18b3800d425d/562912947_generated_image.png",
  kwame: "https://media.base44.com/images/public/6a77e31e472b18b3800d425d/53c95c3ef_generated_image.png",
  esi: "https://media.base44.com/images/public/6a77e31e472b18b3800d425d/3e59223c6_generated_image.png",
};

const IMPACT = [
  { value: "2,400+", label: "Students enrolled" },
  { value: "180+", label: "Live classes hosted" },
  { value: "320+", label: "Certificates issued" },
  { value: "94%", label: "Would recommend" },
];

const FEATURED = {
  name: "Kwame Asante",
  role: "SHS Graduate",
  location: "Kumasi, Ghana",
  photo: PHOTOS.kwame,
  quote: "The live vacation classes and AI teachers kept me studying even when school was closed. I completed my course and printed my certificate — for the first time, my hard work felt real and recognised.",
  result: "Completed 3 courses · Earned certificate",
};

const STORIES = [
  {
    name: "Amina Bello",
    role: "JHS Student",
    location: "Tamale, Ghana",
    photo: PHOTOS.amita,
    quote: "I couldn't afford extra classes before. Eduqasion's weekend sessions helped me finally understand mathematics. My grades jumped and I feel confident writing my BECE.",
    result: "Maths grade improved from C to A",
  },
  {
    name: "Esi Mensah",
    role: "Adult Learner & Shop Owner",
    location: "Cape Coast, Ghana",
    photo: PHOTOS.esi,
    quote: "I dropped out years ago to run my business. Eduqasion's adult classes let me learn at my own pace and still keep my shop open every day. I'm finally finishing what I started.",
    result: "Back to learning after 12 years",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mt-3 bg-[#163cae] text-white px-3 py-4 sm:px-6">
      <div className="lg:max-w-5xl lg:mx-auto">
        <div className="flex items-end justify-between gap-2.5 mb-2">
          <h2 className="text-[22px] sm:text-3xl leading-[1.05] tracking-[-0.8px] font-extrabold text-white m-0">Real Students. Real Impact.</h2>
          <p className="text-[10px] text-[#bdceff] text-right m-0">Success Stories</p>
        </div>
        <p className="text-[10px] sm:text-xs text-[#bdceff] leading-snug mb-3 m-0">
          From classrooms to communities — these are the journeys of learners whose lives changed through live, tuition-friendly education on Eduqasion.
        </p>

        {/* Impact stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
          {IMPACT.map(s => (
            <div key={s.label} className="bg-white/[0.08] border border-white/[0.15] rounded-[20px] py-3 text-center">
              <strong className="block text-[19px] text-[#ffe27a] font-extrabold">{s.value}</strong>
              <span className="text-[9px] text-[#dbe4ff]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Featured testimonial */}
        <article className="bg-white text-[#172653] rounded-[22px] p-4">
          <img src={FEATURED.photo} alt={FEATURED.name} className="w-[58px] h-[58px] object-cover rounded-2xl float-left mr-2.5 mb-1.5" />
          <p className="text-xs sm:text-sm leading-[1.5] m-0">"{FEATURED.quote}"</p>
          <b className="block clear-both pt-2.5 text-xs">{FEATURED.name}</b>
          <small className="text-[#78849e]">{FEATURED.role} · {FEATURED.location}</small>
          <span className="mt-1.5 inline-block bg-[#e4f8ee] text-[#1c7a4e] text-[9px] font-bold px-2 py-1 rounded-full">{FEATURED.result}</span>
        </article>

        {/* More stories */}
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          {STORIES.map(s => (
            <article key={s.name} className="bg-white text-[#172653] rounded-[22px] p-4">
              <img src={s.photo} alt={s.name} className="w-[58px] h-[58px] object-cover rounded-2xl float-left mr-2.5 mb-1.5" />
              <p className="text-xs leading-[1.5] m-0">"{s.quote}"</p>
              <b className="block clear-both pt-2.5 text-xs">{s.name}</b>
              <small className="text-[#78849e]">{s.role} · {s.location}</small>
              <span className="mt-1.5 inline-block bg-[#e4f8ee] text-[#1c7a4e] text-[9px] font-bold px-2 py-1 rounded-full">{s.result}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}