import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, Sparkles, AlertCircle, Zap, ShieldCheck, BrainCircuit } from "lucide-react";

const AuthPage = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // ... (Keep your existing validate and handleSubmit functions exactly as they are)
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (form.username.length < 3) newErrors.username = "Username must be at least 3 characters.";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.email) newErrors.email = "Email is required.";
      else if (!emailRegex.test(form.email)) newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      if (isLogin) await login({ username: form.username, password: form.password });
      else await signup(form);
    } catch (err: any) {
      setErrors({ server: err.message || "Authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden text-foreground selection:bg-primary/30">
      
      {/* --- DYNAMIC BACKGROUND DECOR --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
          animate={{ x: [-20, 20, -20], y: [-20, 40, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ top: "-10%", left: "-5%" }}
        />
        <motion.div 
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]"
          animate={{ x: [20, -40, 20], y: [40, -20, 40] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ bottom: "5%", right: "25%" }}
        />
      </div>

      <div className="flex w-full max-w-[1400px] mx-auto relative z-10 px-6 lg:px-12">
        
        {/* --- LEFT SIDE: HERO CONTENT --- */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col justify-center w-1/2 pr-12 py-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit mb-6">
            <Sparkles size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Next Gen Nutrition AI</span>
          </div>
          
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-6">
            Meet the <br />
            <span className="text-primary drop-shadow-2xl">Council</span> of <br />
            AI Agents.
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-10 font-medium">
            Beyond simple tracking, Diet AI uses a multi-agent architecture to analyze, suggest, and guide you towards balanced diet.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Zap size={18} />, title: "Real-time Analysis", desc: "Instant nutrient breakdown of any meal." },
              { icon: <BrainCircuit size={18} />, title: "Agent Council", desc: "5 specialized AI Agents working for you." },
              { icon: <ShieldCheck size={18} />, title: "Data Privacy", desc: "Enterprise-grade encryption for your logs." },
              { icon: <Sparkles size={18} />, title: "Smart Coaching", desc: "Guides you towards balanced diet." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="p-4 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-sm"
              >
                <div className="text-primary mb-2">{feature.icon}</div>
                <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                <p className="text-muted-foreground text-[11px] leading-tight">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: AUTH CARD --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Logo for mobile only */}
            <div className="lg:hidden text-center mb-10">
               <Sparkles className="w-10 h-10 text-primary mx-auto mb-2" />
               <h1 className="text-3xl font-black uppercase tracking-tighter text-gradient">Diet AI</h1>
            </div>

            <div className="glass border border-border/50 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl relative group">
              {/* Subtle accent border */}
              <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tight mb-2">
                  {isLogin ? "Welcome Back" : "Start Your Journey with Diet AI"}
                </h2>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                  Access your account
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex rounded-2xl bg-muted/50 p-1.5 mb-8 border border-border/50">
                {["Login", "Sign Up"].map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setIsLogin(i === 0);
                      setErrors({});
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                      (i === 0 ? isLogin : !isLogin)
                        ? "bg-background text-primary shadow-xl border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {errors.server && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[11px] font-bold"
                    >
                      <AlertCircle size={16} />
                      <span>{errors.server}</span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">UserName</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className={`w-full px-5 py-4 rounded-2xl bg-muted/30 border transition-all outline-none focus:ring-4 ${
                        errors.username ? 'border-red-500/50 focus:ring-red-500/10' : 'border-border/50 focus:ring-primary/10 focus:border-primary'
                      }`}
                      placeholder={isLogin ? "Enter User Name or Email" : "Enter your User Name"}
                    />
                  </div>

                  {!isLogin && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border/50 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                        placeholder="Enter your Email"
                      />
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border/50 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 mt-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
                  </motion.button>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;