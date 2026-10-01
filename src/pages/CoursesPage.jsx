import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, BookOpen, Clock, User, ArrowRight, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import CartDrawer from "@/components/courses/CartDrawer";
import CartCheckout from "@/components/courses/CartCheckout";
import SiteNav from "@/components/SiteNav";
import { COURSE_REGISTRATION_FEE } from "@/lib/payments";

const CATEGORIES = ["All", "Technology", "Business", "Health", "Education", "Life Skills", "Agriculture", "Arts", "Languages"];
const LEVEL_COLORS = { Beginner: "bg-green-100 text-green-700", Intermediate: "bg-yellow-100 text-yellow-700", Advanced: "bg-red-100 text-red-700" };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("course_cart") || "[]"); } catch { return []; } });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem("course_cart", JSON.stringify(cart)); }, [cart]);

  const addToCart = (course) => {
    if (cart.some(c => c.id === course.id)) return;
    setCart(prev => [...prev, course]);
    toast.success("Added to registration cart");
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const isInCart = (id) => cart.some(c => c.id === id);
  const cartTotal = cart.length * COURSE_REGISTRATION_FEE;

  useEffect(() => {
    base44.entities.Course.filter({ status: "published" }, "-created_date", 100).then(setCourses);
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  // Get category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9ff]">
      <SiteNav
        actions={
          <button onClick={() => setDrawerOpen(true)} className="bg-[#2458e8] text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-2 rounded-xl shadow-[0_3px_0_#173ca9] hover:bg-[#173ca9] inline-flex items-center gap-1 relative transition-colors duration-200">
            <ShoppingCart className="w-3.5 h-3.5" /> Cart
            {cart.length > 0 && <span className="bg-[#ffe27a] text-[#173ca9] text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
          </button>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-500">Free knowledge for everyone, everywhere.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No courses yet</p>
            <p className="text-sm mt-1">Courses will appear here once added.</p>
            <Link to="/admin"><Button className="mt-4">Add First Course</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 h-36 flex items-center justify-center">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    : <BookOpen className="w-12 h-12 text-white/60" />
                  }
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">{course.category}</span>
                    {course.level && <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${LEVEL_COLORS[course.level]}`}>{course.level}</span>}
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium ml-auto">FREE</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {course.instructor_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{course.instructor_name}</span>}
                    {course.duration_weeks && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_weeks} weeks</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant={isInCart(course.id) ? "secondary" : "outline"}
                      className="flex-1"
                      onClick={() => (isInCart(course.id) ? removeFromCart(course.id) : addToCart(course))}
                    >
                      {isInCart(course.id) ? <><Check className="w-4 h-4 mr-1" /> In Cart</> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
                    </Button>
                    <Link to={`/course/${course.id}`} className="flex-1">
                      <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                        Start <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer open={drawerOpen} items={cart} fee={COURSE_REGISTRATION_FEE}
        onClose={() => setDrawerOpen(false)} onRemove={removeFromCart}
        onCheckout={() => { setDrawerOpen(false); setCheckoutOpen(true); }} />
      <CartCheckout open={checkoutOpen} items={cart} total={cartTotal}
        onClose={() => setCheckoutOpen(false)}
        onPaid={() => { setCart([]); localStorage.removeItem("course_cart"); }} />
    </div>
  );
}