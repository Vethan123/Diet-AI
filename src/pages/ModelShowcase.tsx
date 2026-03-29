import { motion } from "framer-motion";
import { 
  Split, Globe, ScanQrCode, Hammer, Activity, AlertOctagon 
} from "lucide-react";

const BOTS = [
  {
    name: "Nutri Orchestrator",
    icon: <Split />,
    color: "bg-purple-500/10 text-purple-500",
    border: "border-purple-500/20",
    description: "The brain of the operation. Routes your queries to the right specialist.",
    tag: "Director"
  },
  {
    name: "Omni Knowledge Bot",
    icon: <Globe />,
    color: "bg-blue-500/10 text-blue-500",
    border: "border-blue-500/20",
    description: "Your general companion for health questions, recipes, and tips.",
    tag: "Expert"
  },
  {
    name: "Nutri Scanner",
    icon: <ScanQrCode />,
    color: "bg-emerald-500/10 text-emerald-500",
    border: "border-emerald-500/20",
    description: "Breaks down your food logs into precise macros and micronutrients.",
    tag: "Analyst"
  },
  {
    name: "Diet Builder",
    icon: <Hammer />,
    color: "bg-amber-500/10 text-amber-500",
    border: "border-amber-500/20",
    description: "Constructs custom meal plans to bridge the gap to your goals.",
    tag: "Architect"
  },
  {
    name: "Nutri Reflector",
    icon: <Activity />,
    color: "bg-pink-500/10 text-pink-500",
    border: "border-pink-500/20",
    description: "Reviews your weekly performance and reflects on your progress.",
    tag: "Coach"
  },
  {
    name: "Missy Monitor",
    icon: <AlertOctagon />,
    color: "bg-red-500/10 text-red-500",
    border: "border-red-500/20",
    description: "The strict guardian. Ensures you never miss a log or a meal.",
    tag: "Enforcer"
  }
];

const ModelShowcase = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">The Diet AI Council</h2>
        <p className="text-muted-foreground text-sm">Six specialized models working in sync to optimize your health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BOTS.map((bot, i) => (
          <motion.div
            key={bot.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl border ${bot.border} bg-card/50 backdrop-blur-sm relative overflow-hidden group`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 ${bot.color.split(' ')[1]}`} />
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${bot.color}`}>
                  {bot.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{bot.tag}</span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-1">{bot.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {bot.description}
                </p>
              </div>

              <div className="pt-2">
                <div className="h-1 w-12 rounded-full bg-primary/20 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ModelShowcase;