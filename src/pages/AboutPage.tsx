import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BOTS } from "./ModelShowcase";
import { useState } from "react";
import { 
  ArrowLeft, Sparkles, ShieldCheck, Zap, 
  Database, Globe, Cpu, ChevronRight, X 
} from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 1. Fixed Animation Variants (naming matched to 'item')
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "out" } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-24 overflow-x-hidden font-sans">
      
      {/* 🖼️ LIGHTBOX OVERLAY (Fixed placement) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 cursor-zoom-out"
          >
            <button className="absolute top-10 right-10 p-3 bg-white/10 rounded-full text-white">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage} 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* 🧭 NAVIGATION */}
      <nav className="p-6 flex items-center justify-between sticky top-0 bg-background/60 backdrop-blur-xl z-[100] border-b border-border/40">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back
        </button>
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
          <Sparkles className="text-primary animate-pulse" size={20} /> 
          DIET AI <span className="text-muted-foreground/40 font-light">CORE</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {/* 🚀 HERO SECTION */}
        <section className="py-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <span className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 inline-block">
              Intelligent Nutritional Architecture
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
              Beyond <span className="text-primary italic">Tracking.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              A multi-agent ecosystem designed to bridge the gap between human appetite and biological necessity.
            </p>
          </motion.div>
        </section>

        {/* 🤖 THE COUNCIL SHOWCASE */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter">The AI Council</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BOTS.map((bot) => (
              <motion.div
                key={bot.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group p-10 rounded-[3rem] border border-border bg-card/30 backdrop-blur-md hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
              >
                <div className="relative z-10 flex flex-col items-center w-full">
                  <div 
                    onClick={() => setSelectedImage(bot.icon.props.src)}
                    className="w-24 h-24 rounded-3xl mb-8 shadow-2xl flex items-center justify-center p-3 bg-background border border-border group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 cursor-zoom-in overflow-hidden relative"
                  >
                    {bot.icon}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <Zap size={24} className="text-white fill-white animate-pulse" />
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-3 block">{bot.tag}</span>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{bot.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium px-2">
                    {bot.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🛠️ SYSTEM CAPABILITIES (Bento Grid) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-right w-full flex justify-end gap-4 items-center">
               <div className="h-[1px] flex-1 bg-gradient-to-l from-border to-transparent" />
               Core Infrastructure
            </h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <motion.div variants={itemVariants} className="md:col-span-2 p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 relative group overflow-hidden">
               <ShieldCheck className="text-emerald-500 mb-6 group-hover:scale-125 transition-transform" size={40} />
               <h3 className="text-2xl font-black mb-4">Enterprise Privacy</h3>
               <p className="text-muted-foreground leading-relaxed">
                 Using RSA-based encryption and pattern-matching for PII Data Protection.
               </p>
               <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/5 rotate-12" />
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2 p-10 rounded-[3rem] bg-blue-500/5 border border-blue-500/20 relative group overflow-hidden">
               <Database className="text-blue-500 mb-6 group-hover:scale-125 transition-transform" size={40} />
               <h3 className="text-2xl font-black mb-4">Cloud Ingestion</h3>
               <p className="text-muted-foreground leading-relaxed">
                 Connected to Microsoft Teams webhooks and Azure Graph APIs.
               </p>
               <Globe className="absolute -bottom-6 -right-6 w-32 h-32 text-blue-500/5" />
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-4 p-12 rounded-[3.5rem] bg-muted/20 border border-border flex flex-col md:row items-center gap-12 group">
                <div className="flex-1">
                  <Cpu className="text-primary mb-6" size={40} />
                  <h3 className="text-3xl font-black mb-4 tracking-tighter">Performance Engine</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    Powered by a FastAPI backend and MongoDB aggregation pipelines.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                   {['Node.js', 'Python', 'FastAPI', 'MongoDB'].map(tech => (
                     <div key={tech} className="px-6 py-4 rounded-2xl bg-background border border-border text-center font-black text-[10px] uppercase tracking-widest shadow-sm">
                        {tech}
                     </div>
                   ))}
                </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 🎬 CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="p-16 rounded-[4rem] bg-primary text-primary-foreground text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h2 className="text-4xl font-black mb-6 relative z-10 tracking-tight">Ready to optimize?</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all relative z-10 flex items-center gap-2 mx-auto shadow-xl"
          >
            Initialize Diet AI <ChevronRight size={16} />
          </button>
        </motion.div>
      </main>

      <footer className="py-20 text-center text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
        Engineered for Excellence • 2026 Edition
      </footer>
    </div>
  );
};

export default AboutPage;