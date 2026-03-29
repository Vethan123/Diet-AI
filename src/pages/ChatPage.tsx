import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// Unified Imports
import { 
  Send, User, Command, BarChart3, Info, X, Activity,
  Split, Globe, ScanQrCode, Hammer, AlertOctagon 
} from "lucide-react";

// Updated Asset Mapping
const MODEL_ASSETS: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  nutri_orchestrator: { 
    icon: <Split size={20} strokeWidth={2.5} />, 
    label: "Nutri Orchestrator", 
    color: "#A78BFA"
  },
  omni_knowledge_bot: { 
    icon: <Globe size={20} strokeWidth={2.5} />, 
    label: "Omni Expert", 
    color: "#60A5FA"
  },
  nutri_scanner: { 
    icon: <ScanQrCode size={20} strokeWidth={2.5} />, 
    label: "Nutri Scanner", 
    color: "#34D399"
  },
  diet_builder: { 
    icon: <Hammer size={20} strokeWidth={2.5} />, 
    label: "Diet Builder", 
    color: "#FBBF24"
  },
  nutri_reflector: { 
    icon: <Activity size={20} strokeWidth={2.5} />, 
    label: "Nutri Reflector", 
    color: "#F472B6"
  },
  missy_monitor: { 
    icon: <AlertOctagon size={20} strokeWidth={2.5} />, 
    label: "Missy Monitor", 
    color: "#F87171"
  }
};

const MODEL_KEYS = Object.keys(MODEL_ASSETS);

// Model Metadata for the Council View
const MODEL_DETAILS: Record<string, { desc: string; tag: string }> = {
  nutri_orchestrator: { desc: "Decides if your query is generic or food-related to route it correctly.", tag: "Director" },
  omni_knowledge_bot: { desc: "Answers any kind of questions and interacts naturally with you.", tag: "Expert" },
  nutri_scanner: { desc: "Analyses nutrients from food queries and updates your nutrition logs.", tag: "Analyst" },
  diet_builder: { desc: "Suggests specific foods to bridge the gap toward a balanced diet.", tag: "Architect" },
  nutri_reflector: { desc: "Reviews your intake levels and provides performance comments.", tag: "Coach" },
  missy_monitor: { desc: "The enforcer. Scolds you if you forget to log your meals.", tag: "Enforcer" }
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", role: "bot", content: "Hello! I'm **Diet AI**. How can I help?", modelName: "omni_knowledge_bot" }
  ]);
  console.log("Current Messages Array:", messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  
  const [activeModel, setActiveModel] = useState<typeof MODEL_ASSETS[string] | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }), 
      });

      const data = await response.json();
      const botContent = data.output.nutri_scanner || data.output.omni_knowledge_bot || "No response received.";
      
      setMessages((prev) => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          role: "bot", 
          content: botContent, 
          modelName: data.agent_used 
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { 
          id: "err-" + Date.now(), 
          role: "bot", 
          content: "Sorry, I encountered an error processing that request.", 
          modelName: "omni_knowledge_bot" 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

 const fetchAnalytics = async () => {
  setIsAnalyticsOpen(true);
  setIsAnalyticsLoading(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/get_user_stats`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    const sheet = data.user_details.overall_nutrient_sheet;
    const chartMap = Object.keys(sheet).map(nutrient => ({
      name: nutrient.split(' (')[0],
      value: sheet[nutrient].reduce((a: number, b: number) => a + b, 0),
      fullValue: `${sheet[nutrient].reduce((a: number, b: number) => a + b, 0)} ${nutrient.includes('mg') ? 'mg' : 'kcal'}`
    })); // REMOVED .filter(d => d.value > 0)

    setAnalyticsData(chartMap);
  } catch (error) {
    console.error(error);
    setAnalyticsData([]);
  } finally {
    setIsAnalyticsLoading(false);
  }
};

  const handlePopupAction = async (type: "summary" | "review") => {
    setPopupContent(null);
    setIsPopupLoading(true);
    setIsPopupOpen(true);
    setActiveModel(type === "summary" ? MODEL_ASSETS.diet_builder : MODEL_ASSETS.nutri_reflector);
    try {
      const endpoint = type === "summary" ? "diet_suggestions" : "review";
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method:'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setPopupContent(type === "summary" ? data.output.diet_builder : `### Nutrition Reflection\n${data.output.nutri_reflector}\n\n### Attendance Status\n${data.output.missy_monitor}`);
    } catch (e) { 
      setPopupContent("Error loading data."); 
    } finally { 
      setIsPopupLoading(false); 
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur flex items-center px-6 h-14">
  <div className="flex items-center gap-4"> {/* Increased gap between buttons */}
    <button 
      onClick={fetchAnalytics} 
      className="flex items-center gap-2 text-[10px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
    >
      <BarChart3 size={14} /> VIEW ANALYTICS
    </button>
    
    <button 
      onClick={() => setIsInfoOpen(true)} 
      className="flex items-center gap-2 text-[10px] font-black bg-muted text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-all border border-border/50"
    >
      <Globe size={14} /> VIEW AGENTS
    </button>
  </div>
  
  <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => navigate('/')}>
      <Command className="text-primary w-5 h-5"/> Diet AI
  </div>

  <button onClick={() => navigate("/profile")} className="ml-auto p-2 hover:bg-muted rounded-full transition-colors">
    <User size={20}/>
  </button>
</header>

      {/* CHAT MAIN */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-[90%] md:w-[60%] lg:w-[50%] mx-auto py-8 flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* ICON BLOCK */}
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-card"}`}
                    style={{ color: msg.role === "bot" ? (MODEL_ASSETS[msg.modelName || ""]?.color || "#A78BFA") : undefined }}
                  >
                    {msg.role === "user" ? (
                      <User size={18} />
                    ) : (
                      // Fallback to Orchestrator icon instead of 🤖 if modelName is missing
                      MODEL_ASSETS[msg.modelName || ""]?.icon || MODEL_ASSETS["nutri_orchestrator"].icon
                    )}
                  </div>

                  {/* MESSAGE CONTENT */}
                  <div className={`p-4 rounded-2xl border shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-card"}`}>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* RESTORED BUTTONS: Summary & Review */}
                    {msg.role === "bot" && (msg.modelName === "nutri_scanner") && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                        <button 
                          onClick={() => handlePopupAction("summary")} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          <BarChart3 size={12}/> Summary
                        </button>
                        <button 
                          onClick={() => handlePopupAction("review")} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          <Info size={12}/> Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && <LinearEmojiLoader />}
          <div ref={endRef} className="h-20" />
        </div>
      </main>

      <footer className="w-full py-6 px-6 bg-background">
        <div className="w-[90%] md:w-[60%] lg:w-[50%] mx-auto relative flex items-end gap-2 bg-muted/40 border border-border rounded-2xl p-2 focus-within:ring-2 ring-primary/20 transition-all">
          <textarea 
            rows={1} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask DietAI anything..." 
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm min-h-[40px]" 
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-xl bg-primary text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18}/>
          </button>
        </div>
      </footer>

      {/* ANALYTICS SIDEBAR */}
      <AnimatePresence>
        {isAnalyticsOpen && (
          <div className="fixed inset-0 z-50 flex justify-start bg-black/20 backdrop-blur-[2px]">
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              className="w-[650px] bg-card border-r border-border h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <Activity className="text-primary" size={24} />
                  <h2 className="font-black text-lg tracking-tight uppercase">Nutrient Analytics</h2>
                </div>
                <button onClick={() => setIsAnalyticsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>

            <div className="flex-1 overflow-y-auto p-6">
  {isAnalyticsLoading ? (
    <div className="h-full flex items-center justify-center"><LinearEmojiLoader /></div>
  ) : (
    <div style={{ height: `${Math.max(400, analyticsData.length * 45)}px` }} className="w-full relative">
      
      {/* ADDED: Empty state overlay text if needed */}
      {analyticsData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest pointer-events-none">
          No data logged yet
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={analyticsData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" hide domain={[0, 'dataMax + 10']} /> {/* Added domain to ensure empty graph looks scaled */}
          <YAxis 
            dataKey="name" 
            type="category" 
            width={130}
            tick={{ fontSize: 12, fontWeight: 800, fill: "hsl(var(--foreground))" }} 
            axisLine={false} 
            tickLine={false} 
            interval={0} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(var(--primary), 0.05)' }} 
            // Only show tooltip if there's actually a value
            content={({ active, payload }) => {
              if (active && payload && payload.length && payload[0].value > 0) {
                return (
                  <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-black text-primary uppercase">{payload[0].payload.name}</p>
                    <p className="text-sm font-bold">{payload[0].payload.fullValue}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {analyticsData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL (Summary/Review) */}
      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card border border-border w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted"
                    style={{ color: activeModel?.color }}
                  >
                    {activeModel?.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-[10px] uppercase text-primary tracking-widest leading-none mb-1">Analysis by</h3>
                    <p className="font-bold text-lg leading-tight">{activeModel?.label}</p>
                  </div>
                </div>
                <button onClick={() => setIsPopupOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground"><X size={22}/></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                {isPopupLoading ? <div className="h-48 flex items-center justify-center"><LinearEmojiLoader /></div> : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{popupContent || ""}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI COUNCIL MODAL */}
      <AnimatePresence>
        {isInfoOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative"
            >
                <button 
                onClick={() => setIsInfoOpen(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full z-10"
                >
                <X size={20} />
                </button>

                <div className="p-10 overflow-y-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">The Diet AI Council</h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Specialized Intelligence Layers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(MODEL_ASSETS).map(([key, asset], i) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-3xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-background"
                            style={{ color: asset.color }}
                        >
                            {asset.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-md">
                            {MODEL_DETAILS[key]?.tag}
                        </span>
                        </div>
                        
                        <h3 className="font-bold text-sm mb-1.5">{asset.label}</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {MODEL_DETAILS[key]?.desc}
                        </p>
                    </motion.div>
                    ))}
                </div>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- LOADER COMPONENT ---
const LinearEmojiLoader = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const itv = setInterval(() => setIndex((p) => (p + 1) % MODEL_KEYS.length), 700);
    return () => clearInterval(itv);
  }, []);
  
  const currentAsset = MODEL_ASSETS[MODEL_KEYS[index]];

  return (
    <div className="flex items-center gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm w-fit">
      <div 
        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
        style={{ color: currentAsset.color }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}>
            {currentAsset.icon}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-col pr-4">
        <span className="text-[9px] font-black uppercase text-primary">Scanning</span>
        <span className="text-[11px] font-medium text-muted-foreground">{currentAsset.label}</span>
      </div>
    </div>
  );
};

export default ChatPage;