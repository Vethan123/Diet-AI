import { useState, useEffect } from "react";
import { motion, AnimatePresence, time } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, RotateCcw, User, Mail, Loader2, 
  CalendarDays, CheckCircle2, XCircle, Clock, Info, ChevronRight
} from "lucide-react";

// --- METER GAUGE COMPONENT ---
const MeterGauge = ({ value, max = 100 }: { value: number; max?: number }) => {
  const pct = Math.min((value / max) * 100, 100);
  const angle = (pct / 100) * 180 - 90;
  const color = pct > 66 ? "142 70% 45%" : pct > 33 ? "38 92% 50%" : "0 84% 60%";

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-24">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={`hsl(${color})`}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.line
            x1="100" y1="100" x2="100" y2="30"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transformOrigin: "100px 100px" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-black text-foreground">{Math.round(value)}</span>
        <span className="text-xs font-bold text-muted-foreground">/{max}</span>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser, logout, daysConfigured } = useApp();
  const navigate = useNavigate();
  
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Guard access
  useEffect(() => {
    if (daysConfigured === null && !user?.time_frame) {
      navigate("/", { replace: true });
    } else {
      setIsCheckingAccess(false);
    }
  }, [daysConfigured, user, navigate]);

  // Fetch Data logic synced with your FastAPI response
  useEffect(() => {
    if (isCheckingAccess) return;
    const fetchData = async () => {
      try {
        const [scoreRes, statsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/calculate_score`, { method: "GET", credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/get_user_stats`, { method: "GET", credentials: "include" })
        ]);
        if (scoreRes.status === 401 || statsRes.status === 401) { logout(); return; }
        
        const sData = await scoreRes.json();
        const stData = await statsRes.json();

        setScore(sData.score_calculator || 0);
        // Correcting the nesting based on your @router.get("/get_user_stats")
        setUserStats(stData.user_details); 
      } catch (e) { 
        console.error("Profile API Error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [logout, isCheckingAccess]);

  const timeline = (() => {
    // Handling the Mongo $date and attendance array
    if (!userStats?.start_date || !userStats?.attendance) return [];
    
    const start = new Date(userStats.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return userStats.attendance.map((att: boolean, i: number) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const isToday = d.getTime() === today.getTime();
      const isPast = d.getTime() < today.getTime();

      let status: 'completed' | 'skipped' | 'pending' = 'pending';
      
      if (att === true) {
        status = 'completed';
      } else if (isPast || (isToday && !att)) {
        status = 'skipped';
      }

      return { 
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        status, 
        isToday 
      };
    });
  })();

  console.log(timeline);

  const handleReset = async () => {
    if (!window.confirm("Reset your journey? All logs will be cleared.")) return;
    setIsResetting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reset`, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (data.reset_status) { updateUser(data.updated_user_details); navigate("/", { replace: true }); }
    } catch (e) { alert("Reset failed"); } finally { setIsResetting(false); }
  };

  if (isCheckingAccess) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border glass sticky top-0 z-50">
        <button onClick={() => navigate("/chat")} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Identity Vault</h1>
        <button onClick={logout} className="text-[10px] font-black uppercase tracking-widest text-destructive hover:underline">Logout</button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* LEFT: METER & USER INFO */}
          <div className="md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-border/30 flex flex-col justify-center items-center text-center">
            <div className="mb-6 relative">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto">
                <User size={32} className="text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background border border-border px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-primary">Active</div>
            </div>
            
            <h2 className="text-2xl font-black tracking-tighter mb-1">{user?.username}</h2>
            <p className="text-[10px] font-medium text-muted-foreground mb-8 truncate max-w-full italic">{user?.email}</p>
            
            <div className="w-full py-6 bg-muted/20 rounded-[2rem] border border-border/20">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Performance Index</p>
              <MeterGauge value={loading ? 0 : score} />
            </div>
          </div>

          {/* RIGHT: COMPUTED JOURNEY LOGS */}
          <div className="md:w-1/2 p-8 bg-muted/5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Journey Logs</h3>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md uppercase">
                {userStats?.time_frame || 0}-Day Plan
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                  <Loader2 className="animate-spin text-primary/30" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Syncing...</p>
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-[10px] text-center py-10 opacity-30 uppercase font-black tracking-widest">No Logs Available</p>
              ) : (
                timeline.map((day, i) => (
                  <motion.div 
                    key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      day.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 
                      day.status === 'skipped' ? 'bg-red-500/5 border-red-500/20' : 'bg-background/50 border-border/30 opacity-60'
                    } ${day.isToday ? 'ring-1 ring-primary border-primary/40 opacity-100' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                         day.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                         day.status === 'skipped' ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {day.status === 'completed' ? <CheckCircle2 size={14} /> : 
                         day.status === 'skipped' ? <XCircle size={14} /> : <Clock size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{day.date}</p>
                        <p className={`text-[8px] font-bold uppercase mt-1 ${
                           day.status === 'completed' ? 'text-green-600' : 
                           day.status === 'skipped' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {day.isToday ? "Current Window" : day.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Logged</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Skipped</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> Future</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleReset} disabled={isResetting}
            className="w-full py-5 rounded-3xl bg-muted/30 border border-border text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:text-destructive hover:border-destructive/30 transition-all disabled:opacity-50"
          >
            {isResetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Reset Journey
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;