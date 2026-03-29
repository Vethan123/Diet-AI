import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";

const AuthPage = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Username validation
    if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    // Password validation
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Email validation (Only for Signup)
    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.email) {
        newErrors.email = "Email is required.";
      } else if (!emailRegex.test(form.email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      if (isLogin) {
        // We only send username and password for login
        await login({
          username: form.username,
          password: form.password,
        });
      } else {
        await signup(form);
      }
    } catch (err: any) {
      // Catch backend 422/404/401 errors and display them
      setErrors({ server: err.message || "Authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden text-foreground">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 mb-3"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gradient">Diet AI</h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">Your Dieting Guide</p>
        </div>

        <div className="glass rounded-2xl p-8 glow-primary">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {["Login", "Sign Up"].map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setIsLogin(i === 0);
                  setErrors({});
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  (i === 0 ? isLogin : !isLogin)
                    ? "bg-primary text-primary-foreground shadow-lg"
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
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Server Error Alert (Dark Red) */}
              {errors.server && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-600/50 flex items-center gap-2 text-red-500 text-xs font-semibold animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.server}</span>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-muted/50 border transition-all outline-none focus:ring-2 ${
                    errors.username 
                      ? 'border-red-600 focus:ring-red-600/20' 
                      : 'border-border focus:ring-primary/20 focus:border-primary'
                  }`}
                  placeholder="Enter Username"
                />
                {errors.username && (
                  <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.username}
                  </p>
                )}
              </div>

              {/* Email Field (Signup Only) */}
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border transition-all outline-none focus:ring-2 ${
                      errors.email 
                        ? 'border-red-600 focus:ring-red-600/20' 
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border transition-all outline-none focus:ring-2 pr-12 ${
                      errors.password 
                        ? 'border-red-600 focus:ring-red-600/20' 
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;