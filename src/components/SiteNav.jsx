import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, LogIn, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// Shared floating pill navigation used across all public pages.
export default function SiteNav({ actions }) {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const moreLinks = [
    { label: "Live Classes", path: "/live-classes" },
    { label: "NOVDEC Prep", path: "/novdec" },
    { label: "Class Dashboard", path: "/class-dashboard" },
    { label: "Ask Help", path: "/ask" },
    { label: "Messages", path: "/messages" },
    { label: "Fees", path: "/fees" },
  ];
  if (!isAuthenticated) moreLinks.push({ label: "Sign Up Free", path: "/register" });
  if (isAdmin) {
    moreLinks.push({ label: "Admin Panel", path: "/admin" });
    moreLinks.push({ label: "Instructor Dashboard", path: "/instructor" });
    moreLinks.push({ label: "Codebox", path: "/codebox" });
  }
  if (isAuthenticated) moreLinks.push({ label: "Sign Out", action: logout });

  return (
    <nav className="sticky top-2 z-50 mx-3 mt-3 sm:mx-6 sm:mt-4 lg:mx-auto lg:max-w-5xl bg-white border border-[#dce4ff] rounded-[22px] px-3 py-2.5 flex items-center justify-between gap-2 shadow-[0_8px_22px_rgba(49,84,196,0.08)]">
      <Link to="/" className="flex items-center gap-2 text-[#1745d1] font-extrabold text-base tracking-tight">
        <span className="w-7 h-7 rounded-[9px] bg-[#2458e8] text-white grid place-items-center shadow-[inset_0_-3px_0_#1439a5]">
          <GraduationCap className="w-4 h-4" />
        </span>
        Eduqasion
      </Link>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden min-[380px]:flex items-center gap-1.5 sm:gap-2">
          <Link to="/courses" className="text-[10px] sm:text-xs font-bold text-[#53617e] hover:text-[#1745d1] whitespace-nowrap">Courses</Link>
          <Link to="/library" className="text-[10px] sm:text-xs font-bold text-[#53617e] hover:text-[#1745d1] whitespace-nowrap">Library</Link>
          <Link to="/ai-teachers" className="text-[10px] sm:text-xs font-bold text-[#53617e] hover:text-[#1745d1] whitespace-nowrap">AI Teachers</Link>
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        <DropdownMenu>
          <DropdownMenuTrigger className="text-[10px] sm:text-xs font-bold text-[#53617e] hover:text-[#1745d1] inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[#f0f4ff] outline-none">
            More <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            {moreLinks.map(item => (
              <DropdownMenuItem
                key={item.label}
                onClick={() => (item.action ? item.action() : navigate(item.path))}
                className="text-xs font-semibold"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          to={isAuthenticated ? "/student-portal" : "/login"}
          className="bg-[#2458e8] text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-2 rounded-xl shadow-[0_3px_0_#173ca9] hover:bg-[#173ca9] inline-flex items-center gap-1 whitespace-nowrap transition-colors duration-200"
        >
          <LogIn className="w-3.5 h-3.5" /> {isAuthenticated ? "My Portal" : "Portal Login"}
        </Link>
      </div>
    </nav>
  );
}