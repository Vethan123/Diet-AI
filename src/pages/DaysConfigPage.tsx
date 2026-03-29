import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Calendar, ChevronRight } from "lucide-react";

const DaysConfigPage = () => {
  const { setDays, daysConfigured, user } = useApp();
  const navigate = useNavigate();
  const [value, setValue] = useState(7);
  const [loading, setLoading] = useState(false);

  // --- REDIRECT LOGIC ---
  // If the user already has a time_frame set in their profile or local state,
  // skip this page and go straight to the chat.
  useEffect(() => {
    if (daysConfigured || user?.time_frame) {
      navigate("/chat", { replace: true });
    }
  }, [daysConfigured, user, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/start`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include", 
        body: JSON.stringify({ time_frame: value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start journey");
      }

      // Update global context state
      // This will trigger the useEffect above to navigate to /chat
      setDays(value);   
      
    } catch (error: any) {
      console.error("API Error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const percentage = ((value - 1) / (15 - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-4 relative z-10"
      >
        <div className="glass rounded-3xl p-10 glow-primary text-center">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
          >
            <Calendar className="w-8 h-8 text-primary" />
          </motion.div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Configure Your Journey</h2>
          <p className="text-muted-foreground text-sm mb-10">Select how many days you'd like to engage with NexusAI</p>

          <motion.div
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <span className="text-7xl font-bold text-gradient">{value}</span>
            <span className="text-xl text-muted-foreground ml-2">days</span>
          </motion.div>

          <div className="relative mb-4 px-2">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
            <input
              type="range"
              min={7}
              max={60}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mb-10 px-2">
            <span>1 day</span>
            <span>15 days</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                Start Journey <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DaysConfigPage;