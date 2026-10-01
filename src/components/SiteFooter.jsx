import { Link } from "react-router-dom";

// Shared footer used across all public pages.
export default function SiteFooter() {
  return (
    <footer className="bg-[#14213d] text-[#c5d0e9] pt-4 pb-4 px-4">
      <div className="lg:max-w-5xl lg:mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <h3 className="text-white text-xs mb-1.5">Eduqasion</h3>
            <p className="text-[10px] leading-snug mb-1.5 m-0">Live extra classes for JHS, SHS, university and adult learners. Tuition-free school with paid weekend &amp; vacation classes.</p>
            <a href="mailto:eduqasion@gmail.com" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">eduqasion@gmail.com</a>
          </div>
          <div>
            <h3 className="text-white text-xs mb-1.5">Academic</h3>
            <Link to="/courses" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">All Courses</Link>
            <Link to="/library" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Ebook Library</Link>
            <Link to="/ai-teachers" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">AI Teachers</Link>
            <Link to="/live-classes" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Live Classes</Link>
            <Link to="/novdec" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">NOVDEC Prep</Link>
            <Link to="/class-dashboard" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Class Dashboard</Link>
          </div>
          <div>
            <h3 className="text-white text-xs mb-1.5">Students</h3>
            <Link to="/login" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Portal Login</Link>
            <Link to="/register" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Sign Up Free</Link>
            <Link to="/student-portal" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Student Portal</Link>
            <Link to="/fees" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Fee Payment</Link>
            <Link to="/ask" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Ask AI Help</Link>
          </div>
          <div>
            <h3 className="text-white text-xs mb-1.5">Faculty &amp; Staff</h3>
            <Link to="/instructor" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Instructor Dashboard</Link>
            <Link to="/admin" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Admin Panel</Link>
            <Link to="/messages" className="block text-[10px] leading-snug mb-1.5 hover:text-[#ffe27a]">Messages</Link>
          </div>
        </div>
        <div className="border-t border-white/20 mt-4 pt-3 text-center text-[9px] text-[#8492b0]">
          © {new Date().getFullYear()} Eduqasion · Live Extra Classes · Weekend &amp; Vacation Learning
        </div>
      </div>
    </footer>
  );
}