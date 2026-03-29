import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, BarChart3, User, Mail, Loader2 } from "lucide-react";

const MeterGauge = ({ value, max = 100 }: { value: number; max?: number }) => {
  const pct = Math.min((value / max) * 100, 100);
  const angle = (pct / 100) * 180 - 90;
  const color = pct > 66 ? "var(--meter-good)" : pct > 33 ? "var(--meter-mid)" : "var(--meter-bad)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-28">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round" />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={`hsl(${color})`}
            strokeWidth="14"
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
          <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-center">
        <span className="text-2xl font-bold text-foreground">{Math.round(value)}</span>
        <span className="text-xs text-muted-foreground">/{max}</span>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser, logout, daysConfigured } = useApp();
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  
  // --- GUARD RAIL ---
  // If user is logged in but journey is not configured, redirect to "/"
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    if (daysConfigured === null && !user?.time_frame) {
      navigate("/", { replace: true });
    } else {
      setIsCheckingAccess(false);
    }
  }, [daysConfigured, user, navigate]);

  useEffect(() => {
    if (isCheckingAccess) return;

    const fetchScore = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/calculate_score`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) throw new Error("Failed to calculate score");

        const data = await response.json();
        setScore(data.score_calculator || 0);
      } catch (error) {
        console.error("Error fetching score:", error);
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [logout, isCheckingAccess]);

  const handleReset = async () => {
    if (!window.confirm("Resetting will clear your current diet plan. You will need to re-configure your days to continue. Proceed?")) return;

    setIsResetting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reset`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Reset failed");

      const data = await response.json();

      if (data.reset_status) {
        // This will trigger the Guard Rail useEffect automatically
        updateUser(data.updated_user_details);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Reset Error:", error);
      alert("Failed to reset journey. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border glass sticky top-0 z-50">
        <button 
          onClick={() => navigate("/chat")} 
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-lg font-bold">Profile</h1>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout} 
          className="px-4 py-1.5 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold shadow-md transition-colors"
        >
          Logout
        </motion.button>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 border border-border/50 shadow-xl"
        >
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.username || "Nexus User"}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {user?.email || "No email linked"}
              </p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Diet Performance Score
            </p>
            <MeterGauge value={loading ? 0 : score} />
            
            {loading && (
              <p className="text-xs text-primary animate-pulse mt-4">Analyzing your metrics...</p>
            )}
          </div>
        </motion.div>

        {/* --- UPDATED FULL WIDTH RESET BUTTON --- */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="w-full" // Removed grid-cols-2 to allow children to fill space
>
  <motion.button
    disabled={isResetting}
    whileHover={{ scale: 1.01 }} // Slightly reduced scale for a more stable look on large buttons
    whileTap={{ scale: 0.99 }}
    onClick={handleReset}
    // Changed to w-full to match the profile card width
    className="w-full py-5 rounded-3xl bg-muted border border-border text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all disabled:opacity-50 shadow-sm"
  >
    {isResetting ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
      <RotateCcw className="w-5 h-5" />
    )}
    Reset Journey
  </motion.button>
</motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;