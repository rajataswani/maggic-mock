import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePaper } from "@/context/PaperContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Settings, BrainCircuit, Sparkles, Search } from "lucide-react";
import FeedbackButton from "@/components/FeedbackButton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardNav from "@/components/DashboardNav"; 
import { motion } from "framer-motion";
import GlassCard from "@/components/dashboard/GlassCard";
import { Input } from "@/components/ui/input";


// Skeleton Loader for sleek loading states
const CardSkeleton = () => (
  <div className="h-[220px] rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
    <div className="p-6 h-full flex flex-col">
      <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>
      <div className="h-4 w-full bg-white/5 rounded mb-6"></div>
      <div className="space-y-2 mt-auto mb-4">
        <div className="h-4 w-1/2 bg-white/10 rounded"></div>
        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
      </div>
      <div className="h-10 w-full bg-white/10 rounded mt-auto"></div>
    </div>
  </div>
);

interface SpecialTest {
  id: string;
  name: string;
  description?: string;
  category?: string;
  numQuestions: number;
  duration: number;
  paperType: string;
}

const Dashboard = () => {
  const { signOut, isAdmin } = useAuth();
  const { paperType } = usePaper();
  const navigate = useNavigate();
  const [specialTests, setSpecialTests] = useState<SpecialTest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ["TWT", "SWT", "FLT/AIMT", "Other/Misc. Practice"];
  const [selectedCategory, setSelectedCategory] = useState("TWT");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate years from 2026 down to 2015
  const years = Array.from({ length: 12 }, (_, i) => 2026 - i);
  
  // Fetch special tests
  useEffect(() => {
    const fetchSpecialTests = async () => {
      try {
        // Only fetch special tests for the current paper type
        const q = query(
          collection(db, "specialTests"),
          where("paperType", "==", paperType)
        );
        
        const querySnapshot = await getDocs(q);
        const tests: SpecialTest[] = [];
        
        querySnapshot.forEach((doc) => {
          tests.push({
            id: doc.id,
            ...doc.data()
          } as SpecialTest);
        });
        
        setSpecialTests(tests);
      } catch (error) {
        console.error("Error fetching special tests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (paperType) {
      fetchSpecialTests();
    }
  }, [paperType]);

  const filteredSpecialTests = specialTests.filter(t => {
    const matchesCategory = (t.category || "Other/Misc. Practice") === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(searchLower) || (t.description?.toLowerCase().includes(searchLower) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2"></div>
      
      <div className="relative z-10">
        <DashboardNav/>
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        
        {/* Header Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex justify-between items-end"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400 text-lg">Pick up right where you left off or start a new challenge.</p>
          </div>
          <FeedbackButton />
        </motion.div>

        {/* Create Personalized Test Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center text-slate-200">
              <Settings className="h-6 w-6 mr-3 text-emerald-400" />
              Create Personalized Test
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-indigo-900/40 border border-white/10 p-1 md:p-8 hover:border-white/20 transition-all duration-500 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://pattern.subtlepatterns.com/patterns/ignasi_pattern_s.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-6 md:p-4 text-center md:text-left">
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start">
                  Tailor Your Experience
                  <Sparkles className="w-6 h-6 ml-3 text-emerald-400 animate-pulse" />
                </h3>
                <p className="text-slate-300 text-lg">
                  Target your weak areas by mixing and matching exact subjects, difficulty levels, and durations to build the absolute perfect mock test for your study plan.
                </p>
              </div>
              
              <Button 
                onClick={() => navigate("/create-test")}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 w-full md:w-auto overflow-hidden relative group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:animate-shimmer" style={{ backgroundSize: '100% 100%' }}></div>
                <span className="relative">Start Building &rarr;</span>
              </Button>
            </div>
          </div>
        </motion.section>

        <Separator className="my-14 bg-white/5" />

        {/* Special Tests Section */}
        {loading ? (
          <section className="mb-16">
            <h2 className="text-2xl font-bold flex items-center mb-8 text-slate-200">
              <BrainCircuit className="h-6 w-6 mr-3 text-indigo-400" />
              Loading Special Tests...
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
            </div>
          </section>
        ) : specialTests.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex flex-col mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center text-slate-200 group">
                  <BrainCircuit className="h-6 w-6 mr-3 text-indigo-400 group-hover:rotate-12 transition-transform" />
                  Special Tests
                </h2>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 w-full sm:w-fit">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 flex-grow sm:flex-grow-0 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? "bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-72 mt-2 lg:mt-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search special tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500 h-10 shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            {filteredSpecialTests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSpecialTests.map((test, index) => (
                  <GlassCard 
                    key={test.id} 
                    title={test.name}
                    description={test.description}
                    meta={[`${test.numQuestions} Questions`, `${test.duration} Minutes`, test.category || "Special Test"]}
                    buttonText="Start Special Test"
                    onClick={() => navigate(`/instructions/special/${test.id}`)}
                    index={index}
                    highlight={true}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
                <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-slate-600 opacity-50" />
                <p className="text-slate-400 text-lg">No tests available in this category yet.</p>
                <p className="text-slate-500 text-sm mt-2">Check back later or try a different category.</p>
              </div>
            )}
            <Separator className="my-14 bg-white/5" />
          </motion.section>
        )}

        {/* Previous Year Papers Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center text-slate-200 group">
              <FileText className="h-6 w-6 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
              Previous Year Papers
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {years.map((year, index) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-100">{paperType || "Paper"} {year}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">65 Questions · 100 Marks · 3 hrs</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/instructions/${year}/set1`)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all"
                  >
                    Shift 1
                  </button>
                  <button
                    onClick={() => navigate(`/instructions/${year}/set2`)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/40 hover:text-white transition-all"
                  >
                    Shift 2
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Dashboard;
